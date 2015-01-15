/**
 * Message Types Reference
 *
 * Actual types will be in TypeScript 1.5+.  However, this TypeScript 1.4
 * version is the current official type specification.
 */

/* These fixed strings have to be stable and are intended to be
 * backwards/forwards compatible.  They are used in the computation of the
 * message fingerprint (for message id) and in the JSON serialization of our
 * messages to disk.  The actual classes that uses these typenames are free to
 * change their names or use inheritance/composition/whatever as long as they
 * eventually identify with one of these types.*/
export var /*const*/ TYPENAME_TEXT_PART = "TextPart";
export var /*const*/ TYPENAME_TAG_PAIR_BEGIN_REF = "TagPairBegin";
export var /*const*/ TYPENAME_TAG_PAIR_END_REF = "TagPairEnd";
export var /*const*/ TYPENAME_HTML_TAG_PAIR = "HtmlTagPair";
export var /*const*/ TYPENAME_NG_EXPR = "NgExpr";


export type MessagePart = string|Placeholder|TagPair;

export interface GetStableTypeName {
  (): string;
}

export interface ToLongFingerprint {
  (): string;
}

export interface MessagePartBase {
  // such as "NgExpr", "HtmlTagPair", etc.
  getStableTypeName: GetStableTypeName;
  toLongFingerprint: ToLongFingerprint;
}

export class TextPart implements MessagePartBase {
  constructor(public value: string) { }

  // degenerate case.
  toLongFingerprint(): string { return this.value; }

  // NOTE: Do NOT replace the fixed string returned by this function with the
  // expression "typeof this".  This name should be stable across versions to
  // ensure stable message ids (hashing).
  getStableTypeName(): string { return TYPENAME_TEXT_PART; }

}

export interface Placeholder extends MessagePartBase {
  name: string;
  text: string;
  examples?: string[];
  comment?: string;
}

export class PlaceholderBase implements MessagePartBase {
  constructor(public name: string, public text: string, public examples: string[], public comment: string) {}
  toLongFingerprint(): string { throw Error("You must use a subclass that overrides this method."); }
  getStableTypeName(): string { throw Error("You must use a subclass that overrides this method."); }
}

export class NgExpr extends PlaceholderBase {
  // TODO: toLongFingerprint must calcuate this in a proper way.
  toLongFingerprint(): string { return TYPENAME_NG_EXPR + this.text; }
  getStableTypeName(): string { return TYPENAME_NG_EXPR; }
}


// TagPairs, when serialized, will use a pair of placeholders to represent
// their begin and end.  TagPairBeginRef and TagPairEndRef represent those placeholders.
export class TagPairRefBase implements Placeholder {
  constructor(public name: string, public text: string, public examples: string[], public comment: string) {}

  // degenerate case.
  toLongFingerprint(): string { return this.text; }

  getStableTypeName(): string { throw Error("You must use a subclass that overrides this method."); }
}

export class TagPairBeginRef extends TagPairRefBase {
  // NOTE: Do NOT replace the fixed string returned by this function with the
  // expression "typeof this".  This name should be stable across versions to
  // ensure stable message ids (hashing).
  getStableTypeName(): string { return TYPENAME_TAG_PAIR_BEGIN_REF; }
}

export class TagPairEndRef extends TagPairRefBase {
  // NOTE: Do NOT replace the fixed string returned by this function with the
  // expression "typeof this".  This name should be stable across versions to
  // ensure stable message ids (hashing).
  getStableTypeName(): string { return TYPENAME_TAG_PAIR_END_REF; }
}



export class TagPair implements MessagePartBase {
  constructor(
      // tag name: e.g. "span" for the HTML <span> tag.
      public tag: string,
      // original full begin tag with all attributes, etc. as is.
      public begin: string,
      // original full end tag.
      public end: string,
      public parts: MessagePart[],
      public examples: string[],
      // canonical_key
      public tagFingerprintLong: string,
      public beginPlaceholderRef: TagPairBeginRef, // ph_begin
      public endPlaceholderRef: TagPairEndRef // ph_end
  ) {
    // Assert that only a subclass that has implemented a proper
    // getStableTypeName() method is beging constructed.
    this.getStableTypeName();
  }

  // degenerate case.
  toLongFingerprint(): string { return this.tagFingerprintLong; }

  getStableTypeName(): string { throw Error("You must use a subclass that overrides this method."); }
}


export class HtmlTagPair extends TagPair {
  // degenerate case.
  toLongFingerprint(): string { return this.tagFingerprintLong; }

  getStableTypeName(): string { return TYPENAME_HTML_TAG_PAIR; }

  static NewForParsing(
      tag: string,
      begin: string,
      end: string,
      parts: MessagePart[],
      examples: string[],
      tagFingerprintLong: string): HtmlTagPair {
    var beginPlaceholderRef = new TagPairBeginRef(
        /* name = */ void 0, // names are resolved much later
        /* text = */ begin,
        /* examples = */ [begin],
        /* comment = */ `Begin HTML <${tag}> tag`
        )
    var endPlaceholderRef = new TagPairEndRef(
        /* name = */ void 0, // names are resolved much later
        /* text = */ end,
        /* examples = */ [end],
        /* comment = */ `End HTML </${tag}> tag`
        )
    return new HtmlTagPair(tag, begin, end, parts, examples,
                           tagFingerprintLong, beginPlaceholderRef, endPlaceholderRef);
  }
}

export interface PlaceHoldersMap {
  [placeholderName: string]: Placeholder;
}

export class Message {
  constructor(public id: string,
              public meaning: string,
              public comment: string, /* CKCK: new */
              public parts: MessagePart[],
              public placeholdersMap: PlaceHoldersMap) {}
}
