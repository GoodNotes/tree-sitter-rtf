module.exports = grammar({
  name: "rtf",
  rules: {
    document: $ => alias($.group, 'document'),

    group: $ => seq('{', repeat($._element), '}'),

    comment_group: () => seq('{\\*', /[^\}]+/, '}'),

    _element: $ => choice(
      $.control_word,
      $.control_symbol,
      $.group,
      $.font_table,
      $.color_table,
      $.utf8,
      $.utf16,
      $.comment_group,
      $.text,
      $.line_jump,
    ),

    font_table: $ => seq(
      '\\fonttbl',
      repeat($.font_config),
    ),

    font_config: $ => seq(
      $.font_id,
      repeat($.control_word),
      /\s/,
      field('name', /[^;]+/), 
      ';'
    ),

    font_id: () => seq('\\f', field('id', /\d+/)),

    color_table: $ => seq('\\colortbl;', repeat($.color)),

    color: () => seq(
      '\\red', field('red', /\d+/),
      '\\green', field('green', /\d+/),
      '\\blue', field('blue', /\d+/),
      ';'
    ),

    utf8: () => seq('\\\'', /[a-zA-Z0-9]{2}/),

    utf16: () => seq('\\u', /\d+/),

    control_word: () => seq(
      '\\', 
      field('name', /\w+/),
      optional(field('value', /-?\d+/)),
      optional(/[^\\]/)
    ),

    control_symbol: () => seq(
      '\\', 
      field('name', /\W/),
    ),

    line_jump: () => /\\\n/,

    text: () => field('text', /[^\\\\}\\{]+/),
  },
});

