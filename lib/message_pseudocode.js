"use strict;"

var logging = require('logging');
logger = logging.getLogger(__name__);
var cgi = require('cgi'),
    itertools = require('itertools'),
    re = require('re'),
    hashlib = require('hashlib');

// class Error extends Exception;
function Error() {
}

Error.prototype = Object.create(Exception.prototype);

// class LintError extends Error;
function LintError() {
}

LintError.prototype = Object.create(Error.prototype);

// class OnParseBase;
function OnParseBase() {
}

OnParseBase.prototype.on_attrib = function on_attrib(message, node, attr) {
}

OnParseBase.prototype.on_node = function on_node(message, node) {
}
CONTEXT_RAW = 0;
CONTEXT_HTML = 1;
CONTEXT_ATTRIBUTE_VALUE = 2;

function _escape(text, escaping_context) {
  if ((escaping_context == CONTEXT_RAW)) {
    return text;
  } else if ((escaping_context == CONTEXT_HTML)) {
    return cgi.escape(text);
  } else if ((escaping_context == CONTEXT_ATTRIBUTE_VALUE)) {
    return cgi.escape(text, true);
  } else {
    throw Error('Unknown escaping context: {0}'.format(escaping_context));
  }
}

// class SourceFile;
function SourceFile() {
}

// class SourceReference;
function SourceReference() {
}

// class Message;
function Message(d, meaning, comment, parts, placeholders_by_name) {
  this.id = id;
  this.meaning = meaning;
  this.comment = comment;
  this.parts = parts;
  this.placeholders_by_name = placeholders_by_name;
}

Message.prototype._unparse_part = function _unparse_part(part) {
  return (isinstance(part, str) ? part : part.unparse());
}

Message.prototype.unparse = function unparse() {
  return ''.join(map(this._unparse_part, this.parts));
}

Message.prototype.toString = function toString() {
  kvs = [[k, v] for [k, v] in ([k, getattr(this, k)] for k in 'id meaning comment parts'.split()) if v];
  return ('Message(%s)' % ', '.join((('%s=%s' % [k, ((v is list) ? pf(v) : repr(v))]) for [k, v] in kvs)));
}

Message.prototype.__repr__ = function __repr__() {
  return str(this);
}
ParsedComment = namedtuple('ParsedComment', ['meaning', 'comment']);

function parse_raw_comment(raw_comment) {
  parts = tuple(raw_comment.split('|', 1));
  parts = [part.strip() for part in parts];
  if ((len(parts) == 1)) {
    return ParsedComment(null, parts[0]);
  }
  meaning = parts[0];
  comment = parts[1];
  if ((not meaning)) {
    throw LintError('meaning was explicitly specified but is empty');
  }
  return ParsedComment(meaning, comment);
}

function get_fingerprint(obj) {
  return (isinstance(obj, str) ? obj : obj.get_fingerprint());
}

// class PlaceholderRegistry;
function PlaceholderRegistry() {
  this._names_seen = set();
  this._by_canonical = OrderedDict();
  this._counts_by_prefix = defaultdict((function() { return itertools.count(1); }));
  this.counter = itertools.count(1);
}

PlaceholderRegistry.prototype.to_dict = function to_dict() {
  for placeholder_or_tag in this._by_canonical.values() {
    this._ensure_name(placeholder_or_tag);
  }
  result = OrderedDict();
  for placeholder_or_tag in this._by_canonical.values() {
    if (isinstance(placeholder_or_tag, Placeholder)) {
      result[placeholder_or_tag.name] = placeholder_or_tag;
    } else if (isinstance(placeholder_or_tag, TagPair)) {
      tag_pair = placeholder_or_tag;
      result[tag_pair.ph_begin.name] = tag_pair.ph_begin;
      result[tag_pair.ph_end.name] = tag_pair.ph_end;
    } else {
      throw Error('Internal Error');
    }
  }
  return result;
}

PlaceholderRegistry.prototype._generate_name_hint = function _generate_name_hint(placeholder) {
  if (isinstance(placeholder, TagPair)) {
    MAPPINGS = defaultdict(dict, {HtmlTagPair.__name__: dict(A='LINK')});
    return MAPPINGS.get(placeholder.__class__.__name__).get(placeholder.tag.upper(), placeholder.tag.upper());
  } else {
    return (isinstance(placeholder, NgExpr) ? 'EXPRESSION' : 'PH');
  }
}

PlaceholderRegistry.prototype._ensure_names_for_tag = function _ensure_names_for_tag(placeholder) {
  if (placeholder.ph_begin.name) {
    return;
  }
  name_hint = this._generate_name_hint(placeholder);
  begin_basename = ph_begin_name = (name_hint + '_BEGIN');
  end_basename = ph_end_name = (name_hint + '_END');
  counter = this._counts_by_prefix[begin_basename];
  while ((ph_begin_name in this._names_seen) or (ph_end_name in this._names_seen)) {
    count = next(counter);
    ph_begin_name = '{0}_{1}'.format(begin_basename, count);
    ph_end_name = '{0}_{1}'.format(end_basename, count);
  }
  this._names_seen.add(ph_begin_name);
  this._names_seen.add(ph_end_name);
  placeholder.ph_begin.name = ph_begin_name;
  placeholder.ph_end.name = ph_end_name;
}

PlaceholderRegistry.prototype._ensure_name_for_placeholder = function _ensure_name_for_placeholder(placeholder) {
  if (placeholder.name) {
    return;
  }
  basename = name = this._generate_name_hint(placeholder);
  counter = this._counts_by_prefix[basename];
  while (name in this._names_seen) {
    name = '{0}_{1}'.format(basename, next(counter));
  }
  this._names_seen.add(name);
  placeholder.name = name;
}

PlaceholderRegistry.prototype._ensure_name = function _ensure_name(placeholder) {
  if (isinstance(placeholder, TagPair)) {
    this._ensure_names_for_tag(placeholder);
  } else {
    this._ensure_name_for_placeholder(placeholder);
  }
}

PlaceholderRegistry.prototype.reserve_new_tag = function reserve_new_tag(tagName) {
  canonical_key = 'TAG_{0}_{1}'.format(tagName, next(this.counter));
  this._by_canonical[canonical_key] = null;
  return canonical_key;
}

PlaceholderRegistry.prototype.update_placeholder = function update_placeholder(placeholder) {
  if (isinstance(placeholder, TagPair)) {
    return this._update_tag_placeholder(placeholder);
  } else {
    return this._update_simple_placeholder(placeholder);
  }
}

PlaceholderRegistry.prototype._update_tag_placeholder = function _update_tag_placeholder(placeholder) {
  canonical_key = placeholder.get_fingerprint();
  this._by_canonical[canonical_key] = placeholder;
  return placeholder;
}

PlaceholderRegistry.prototype._update_simple_placeholder = function _update_simple_placeholder(placeholder) {
  canonical_key = placeholder.get_fingerprint();
  existing_placeholder = this._by_canonical.get(canonical_key);
  if ((existing_placeholder is not null)) {
    num_names = (bool(placeholder.name) + bool(existing_placeholder.name));
    if ((num_names == 2)) {
      if ((placeholder.name != existing_placeholder.name)) {
        throw Error('The same placeholder occurs more than once with a different placeholder name.');
      }
    } else if ((num_names == 1)) {
      if ((placeholder.name is null)) {
        placeholder.name = existing_placeholder.name;
      } else {
        existing_placeholder.name = placeholder.name;
      }
    }
  } else {
    this._by_canonical[canonical_key] = placeholder;
  }
  return placeholder;
}
ESCAPE_CHAR = '\x10';
ESCAPE_END = (ESCAPE_CHAR + '.');
BEGIN_TEXT = (ESCAPE_CHAR + "'");
BEGIN_PH = (ESCAPE_CHAR + 'X');
BEGIN_TAG = (ESCAPE_CHAR + '<');
END_TAG = (ESCAPE_CHAR + '>');

function _escape_text_for_message_id(text) {
  return text.replace(ESCAPE_CHAR, (ESCAPE_CHAR + ESCAPE_CHAR));
}

// class MessageBuilder;
function MessageBuilder(raw_comment=null, parent=null, raw_message=null) {
  this.parent = parent;
  parsed_comment = parse_raw_comment(raw_comment);
  this.meaning = parsed_comment.meaning;
  this.comment = parsed_comment.comment;
  this.placeholder_registry = (parent ? parent.placeholder_registry : PlaceholderRegistry());
  if (isinstance(raw_message, str)) {
    this.parts = parse_message_text_for_ng_expressions(raw_message, this.placeholder_registry);
  } else {
    this.parts = parse_node_contents(raw_message, this.placeholder_registry);
  };
}

MessageBuilder.prototype._gen_id_parts_for_subparts = function _gen_id_parts_for_subparts(parts) {
  placeholders = {};
  for part in parts {
    if (isinstance(part, str)) {
      (yield '{0}{2}{1}'.format(BEGIN_TEXT, ESCAPE_END, _escape_text_for_message_id(part)));
    } else if (isinstance(part, Placeholder)) {
      placeholders[part.name] = part;
    } else if (isinstance(part, TagPair)) {
      (yield '{0}{1},{2}{3}'.format(BEGIN_TAG, part.ph_begin.name, type(part).__name__, ESCAPE_END));
      for i in this._gen_id_parts_for_subparts(part.parts) {
        (yield i);
      }
    } else {
      throw Error('Encountered unknown message part type while computing message ID: {0}'.format(type(part)));
    }
  }
  for name in sorted(placeholders) {
    placeholder = placeholders[name];
    (yield '{0}{1},{2}{3}'.format(BEGIN_PH, name, type(placeholder).__name__, ESCAPE_END));
  }
}

MessageBuilder.prototype._gen_id_parts = function _gen_id_parts() {
  (yield _escape_text_for_message_id((this.meaning or '')));
  for i in this._gen_id_parts_for_subparts(this.parts) {
    (yield i);
  }
}

MessageBuilder.prototype._compute_id = function _compute_id() {
  hasher = hashlib.md5();
  for part in this._gen_id_parts() {
    hasher.update(part.encode('utf-8'));
  }
  return hasher.hexdigest();
}

MessageBuilder.prototype.build = function build() {
  id = this._compute_id();
  placeholders_by_name = this.placeholder_registry.to_dict();
  return Message(id=id, meaning=this.meaning, comment=this.comment, parts=this.parts, placeholders_by_name=placeholders_by_name);
}
I18N_ATTRIB_PREFIX = 'i18n-';

// class MessagePart;
function MessagePart() {
}

MessagePart.prototype.get_fingerprint = function get_fingerprint() {
  throw NotImplementedError('Override in subclass');
}

MessagePart.prototype.unparse = function unparse() {
  throw NotImplementedError('Override in subclass');
}

// class Placeholder extends MessagePart;
function Placeholder(name, text, examples, comment) {
  this.name = name;
  this.text = text;
  this.examples = examples;
  this.comment = comment;
}

Placeholder.prototype = Object.create(MessagePart.prototype);

Placeholder.prototype.__repr__ = function __repr__() {
  if (this.name) {
    return ('%s[%s](%r)' % [this.name, this.__class__.__name__, this.text]);
  } else {
    return ('%s(%r)' % [this.__class__.__name__, this.text]);
  }
}
toString = __repr__;

// class TagPairBeginRef extends Placeholder;
function TagPairBeginRef(ml_tag_pair, examples=null, comment=null) {
  this.html_tag_pair = html_tag_pair;
  name = null;
  text = html_tag_pair.begin;
  super(TagPairBeginRef, this).__init__(name, text, examples, comment);
}

TagPairBeginRef.prototype = Object.create(Placeholder.prototype);

// class TagPairEndRef extends Placeholder;
function TagPairEndRef(ml_tag_pair, examples=null, comment=null) {
  this.html_tag_pair = html_tag_pair;
  name = null;
  text = html_tag_pair.end;
  super(TagPairEndRef, this).__init__(name, text, examples, comment);
}

TagPairEndRef.prototype = Object.create(Placeholder.prototype);

// class NgExpr extends Placeholder;
function NgExpr(name, text, examples, comment) {
  super(NgExpr, this).__init__(name, text, examples, comment);
}

NgExpr.prototype = Object.create(Placeholder.prototype);

NgExpr.prototype.get_fingerprint = function get_fingerprint() {
  return [type(this), this.text];
}

NgExpr.prototype.unparse = function unparse() {
  return ('{{%s}}' % this.text);
}

// class TagPair extends MessagePart;
function TagPair(ag, begin, end, parts, examples, canonical_key, ph_begin=null, ph_end=null) {
  this.tag = tag;
  this.begin = begin;
  this.end = end;
  this.parts = parts;
  this.examples = examples;
  this.canonical_key = canonical_key;
  this.ph_begin = (ph_begin ? ph_begin : TagPairBeginRef(this));
  this.ph_end = (ph_end ? ph_end : TagPairEndRef(this));
}

TagPair.prototype = Object.create(MessagePart.prototype);

TagPair.prototype.unparse = function unparse() {
  throw NotImplementedError('Override in subclass');
}

TagPair.prototype.__repr__ = function __repr__() {
  [ph_begin_name, ph_end_name] = [this.ph_begin.name, this.ph_end.name];
  if ((not ph_begin_name)) {
    ph_begin_name = (this.tag.upper() + '_BEGIN_XX');
    ph_end_name = (this.tag.upper() + '_END_XX');
  }
  return ('%s(%s\u2026%s)%r%s' % [ph_begin_name, this.begin, this.end, this.parts, ph_end_name]);
}

// class HtmlTagPair extends TagPair;
function HtmlTagPair(ag, begin, end, parts, examples, canonical_key) {
  super(HtmlTagPair, this).__init__(tag, begin, end, parts, examples, canonical_key);
  this.ph_begin = TagPairBeginRef(this, examples=[this.begin], comment='Begin HTML <{0}> tag'.format(this.tag));
  this.ph_end = TagPairEndRef(this, examples=[this.end], comment='End HTML </{0}> tag'.format(this.tag));
}

HtmlTagPair.prototype = Object.create(TagPair.prototype);

HtmlTagPair.prototype.get_fingerprint = function get_fingerprint() {
  return this.canonical_key;
  return [type(this), this.begin, this.end, tuple(map(get_fingerprint, this.parts))];
}

HtmlTagPair.prototype._unparse_parts = function _unparse_parts(unparsed_parts) {
  for part in this.parts {
    if (isinstance(part, HtmlTagPair)) {
      part._unparse(unparsed_parts);
    } else {
      unparsed_parts.append(cgi.escape((isinstance(part, str) ? part : part.unparse())));
    }
  }
}

HtmlTagPair.prototype._unparse = function _unparse(unparsed_parts) {
  unparsed_parts.append(this.begin);
  this._unparse_parts(unparsed_parts);
  unparsed_parts.append(this.end);
}

HtmlTagPair.prototype.unparse = function unparse() {
  unparsed_parts = [];
  this._unparse(unparsed_parts);
  return ''.join(unparsed_parts);
}

function validate_valid_placeholder_name(ph_name) {
  name = ph_name;
  if ((not name)) {
    throw Error(('invalid placeholder name: %r: empty name' % ph_name));
  }
  if ((name.startswith('_') or name.endswith('_'))) {
    throw Error(("invalid placeholder name: %r: can't begin or end with an underscore" % ph_name));
  }
  name = name.replace('_', '');
  if (((not name.isalnum()) or (name.upper() != name))) {
    throw Error('invalid placeholder name: %r: It may only be composed of capital letters, digits and underscores.');
  }
  if ((name == 'EMBEDDED_MESSAGES')) {
    throw Error('invalid placeholder name: %r: This name is reserved.');
  }
}
ng_expr_ph_re = re.compile('i18n-ph\\((.*)\\)');

function parse_ng_expression(text) {
  text = text.strip();
  parts = text.rsplit('//', 1);
  comment = 'Angular Expression';
  if ((len(parts) == 1)) {
    return NgExpr(name=null, text=text, examples=null, comment=comment);
  }
  text = parts[0].strip();
  raw_comment = parts[(-1)].strip();
  m = ng_expr_ph_re.match(raw_comment);
  if ((not m)) {
    throw Error("Angular expression has a comment but it wasn't valid i18n-ph() syntax");
  }
  ph_text = m.group(1).strip();
  parts = ph_text.split('|', 1);
  if (len(parts)) {
    ph_name = parts[0].strip();
    example = parts[(-1)].strip();
  } else {
    ph_name = ph_text;
    example = null;
  }
  validate_valid_placeholder_name(ph_name);
  examples = ((not example) ? null : [example]);
  return NgExpr(name=ph_name, text=text, examples=examples, comment=comment);
}
ng_expr_re = re.compile('\\{\\{\\s*(.*?)\\s*\\}\\}');

function parse_message_text_for_ng_expressions(text, placeholder_registry) {
  parts = [];
  splits = iter((ng_expr_re.split(text) + ['']));
  for [txt, expr] in zip(splits, splits) {
    if (txt) {
      parts.append(txt);
    }
    expr = expr.strip();
    if (expr) {
      ng_expr = parse_ng_expression(expr);
      ng_expr = placeholder_registry.update_placeholder(ng_expr);
      parts.append(ng_expr);
    }
  }
  return parts;
}
HtmlBeginEndTags = namedtuple('HtmlBeginEndTags', ['begin', 'end']);

function _serialize_html_attr(name, value) {
  if ((value is null)) {
    return name;
  }
  [squote, dquote] = ["'", '"'];
  [have_squote, have_dquote] = [(squote in value), (dquote in value)];
  quote_char = (((not have_squote) and have_dquote) ? squote : dquote);
  escaped_value = cgi.escape(value, (have_squote and have_dquote));
  return '{0}={2}{1}{2}'.format(name, escaped_value, quote_char);
}

function _get_serialized_attrs(node) {
  return ' '.join((_serialize_html_attr(name, value) for [name, value] in node.attrib.items()));
}

function _get_html_begin_end_tags(node) {
  serialized_attrs = _get_serialized_attrs(node);
  if (serialized_attrs) {
    serialized_attrs = (' ' + serialized_attrs);
  }
  begin = '<{0}{1}>'.format(node.tag, serialized_attrs);
  end = '</{0}>'.format(node.tag);
  return HtmlBeginEndTags(begin=begin, end=end);
}

function __parse_node(node, placeholder_registry) {
  canonical_key = placeholder_registry.reserve_new_tag(node.tag);
  [begin, end] = _get_html_begin_end_tags(node);
  parts = [];
  if (node.text) {
    parts.extend(parse_message_text_for_ng_expressions(node.text, placeholder_registry));
  }
  for child in node {
    parts.append(__parse_node(child, placeholder_registry));
    if (child.tail) {
      parts.extend(parse_message_text_for_ng_expressions(child.tail, placeholder_registry));
    }
  }
  tag_pair = HtmlTagPair(tag=node.tag, begin=begin, end=end, parts=parts, examples=null, canonical_key=canonical_key);
  placeholder_registry.update_placeholder(tag_pair);
  return tag_pair;
}

function parse_node_contents(root, placeholder_registry) {
  parts = parse_message_text_for_ng_expressions(root.text, placeholder_registry);
  for child in root {
    parts.append(__parse_node(child, placeholder_registry));
    if (child.tail) {
      parts.extend(parse_message_text_for_ng_expressions(child.tail, placeholder_registry));
    }
  }
  return parts;
}

function pretty_format_node_contents(node) {
  parts = [node.text];
  for child in node {
    parts.append(pf(child));
  }
  return ' '.join(parts);
}

// class MessageParser;
function MessageParser(on_parse, __private_constructor) {
  if ((__private_constructor is not MessageParser.__id)) {
    throw Error('Private constructor');
  }
  this.on_parse = on_parse;
  this.nodes = deque();
  this.messages = OrderedDict();
}
__id = object();

MessageParser.prototype._parse_i18n_attribs = function _parse_i18n_attribs(node) {
  attribs = node.keys();
  i18n_attribs = [name for name in attribs if name.startswith(I18N_ATTRIB_PREFIX)];
  if ((not i18n_attribs)) {
    return;
  }
  for i18n_attrib in i18n_attribs {
    raw_comment = node.get(i18n_attrib);
    attr = i18n_attrib[len(I18N_ATTRIB_PREFIX):];
    raw_message = node.get(attr);
    message = MessageBuilder(raw_comment=raw_comment, raw_message=raw_message).build();
    this.messages[message.id] = message;
    this.on_parse.on_attrib(message, node, attr);
  }
}

MessageParser.prototype._parse_messages_in_i18n_node = function _parse_messages_in_i18n_node(node) {
  i18n = node.get('i18n');
  if ((i18n is null)) {
    return;
  }
  logger.debug('i18n=%r', i18n);
  message = MessageBuilder(raw_comment=i18n, raw_message=node).build();
  this.messages[message.id] = message;
  this.on_parse.on_node(message, node);
}

MessageParser.prototype._parse_messages = function _parse_messages(root) {
  this.nodes.append(root);
  while this.nodes {
    node = this.nodes.popleft();
    this._parse_i18n_attribs(node);
    i18n = node.get('i18n');
    if ((i18n is not null)) {
      this._parse_messages_in_i18n_node(node);
      continue;
    }
    this.nodes.extend(node);
  }
}
@staticmethod;

MessageParser.prototype.parse_messages = function parse_messages(root, on_parse=null) {
  if ((on_parse is null)) {
    on_parse = OnParseBase();
  }
  parser = MessageParser(on_parse, MessageParser.__id);
  parser._parse_messages(root);
  return parser.messages;
}
parse_messages = MessageParser.parse_messages
