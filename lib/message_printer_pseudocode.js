"use strict;"

var logging = require('logging');
logger = logging.getLogger(__name__);

// class Error extends Exception;
function Error() {
}

Error.prototype = Object.create(Exception.prototype);

// class MessagePrinter;
function MessagePrinter(printer=null) {
  this.printer = (printer ? printer : term_printer.TermPrinter());
}

MessagePrinter.prototype._write_user_text = function _write_user_text(text) {
  p = this.printer;
  with p.show_nl(style=S.style_carriage_return) {
    p.write(text, style=S.style_user_text);
  }
}

MessagePrinter.prototype._print_label_and_text = function _print_label_and_text(label, text, oneline=false) {
  p = this.printer;
  if (oneline) {
    p.write(label, style=S.style_label);
    p.write(': ');
    this._write_user_text(text);
  } else {
    p.print(label, style=S.style_label);
    with this.printer.indent() {
      this._write_user_text(text);
    }
  }
  p.print();
}

MessagePrinter.prototype._write_placeholder = function _write_placeholder(placeholder) {
  p = this.printer;
  p.print(S.style_placeholder(placeholder.name));
  with p.indent() {
    if (placeholder.comment) {
      this._print_label_and_text('comment', placeholder.comment, oneline=true);
    }
    if (placeholder.examples) {
      if ((len(placeholder.examples) == 1)) {
        p.write(S.style_h2('example'));
        p.write(': ');
        example = placeholder.examples[0];
        p.print(example);
      } else {
        p.print(S.style_h2('Examples'));
        with p.indent() {
          for example in placeholder.examples {
            p.print(example);
          }
        }
      }
    }
  }
}

MessagePrinter.prototype._write_placeholders = function _write_placeholders(placeholders_by_name) {
  p = this.printer;
  p.print(S.style_h2('Placeholders'));
  with p.indent() {
    for [name, placeholder] in placeholders_by_name.items() {
      this._write_placeholder(placeholder);
    }
  }
}

MessagePrinter.prototype._write_message_parts = function _write_message_parts(parts) {
  p = this.printer;
  for part in parts {
    if (isinstance(part, str)) {
      this._write_user_text(part);
    } else if (isinstance(part, message.Placeholder)) {
      p.write(part.name, style=S.style_placeholder);
    } else if (isinstance(part, message.TagPair)) {
      p.write(part.ph_begin.name, style=S.style_placeholder);
      p.write(' ');
      this._write_message_parts(part.parts);
      p.write(part.ph_end.name, style=S.style_placeholder);
    } else {
      throw Error('Unexpected condition');
    }
    p.write(' ');
  }
}

MessagePrinter.prototype.print_message = function print_message(msg) {
  p = this.printer;
  p.print('{0}: id={1}'.format(S.style_h1('MESSAGE'), msg.id));
  with p.indent() {
    this._write_message_parts(msg.parts);
    p.print();
    if (msg.meaning) {
      this._print_label_and_text('meaning', msg.meaning);
    }
    if (msg.comment) {
      this._print_label_and_text('comment', msg.comment);
    }
    this._write_placeholders(msg.placeholders_by_name);
  }
}
