export type ParseErrorDetails = {
  offset?: number;
  tokenIndex?: number;
  clause?: string;
};

export class ParseError extends Error {
  readonly offset?: number;
  readonly tokenIndex?: number;
  readonly clause?: string;

  constructor(message: string, details?: ParseErrorDetails) {
    const bits = [message];
    if (details?.clause) bits.push(`in ${details.clause}`);
    if (details?.tokenIndex !== undefined) bits.push(`at token ${details.tokenIndex}`);
    if (details?.offset !== undefined) bits.push(`at char ${details.offset}`);
    super(bits.join(" · "));
    this.name = "ParseError";
    this.offset = details?.offset;
    this.tokenIndex = details?.tokenIndex;
    this.clause = details?.clause;
  }
}
