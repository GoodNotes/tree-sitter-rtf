module.exports = grammar({
  name: "rtf",
  rules: {
    document: $ => alias($.group, 'document'),

    group: $ => seq('{', repeat($._element), '}'),

    comment_group: () => seq('{\\*', /[^\}]+/, '}'),

    // Visible static literal
    static_number_literal: $ => /\d+/,
    static_dash_number_literal: $ => /-?\d+/,
    static_word_literal: $ => /\w+/,
    static_text_literal: $ => /[^\\\\}\\{]+/,

    // Hidden static literal
    _static_single_space: $ => /\s/,
    _static_line_break: $ => /\\\n/,
    _static_two_characters_literal: $ =>  /[a-zA-Z0-9]{2}/,
    _static_uppercase_letter_literal: $ => /\W/,
    
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
      $._static_single_space,
      field('name', /[^;]+/), 
      ';'
    ),

    font_id: $ => seq('\\f', field('id', $.static_number_literal)),

    color_table: $ => seq('\\colortbl;', repeat($.color)),

    color: $ => seq(
      '\\red', field('red', $.static_number_literal),
      '\\green', field('green', $.static_number_literal),
      '\\blue', field('blue', $.static_number_literal),
      ';'
    ),

    utf8: $ => seq('\\\'', $._static_two_characters_literal),

    utf16: $ => seq('\\u', $.static_number_literal),

    control_word: $ => seq(
      '\\', 
      field('name', $.static_word_literal),
      optional(field('value', $.static_dash_number_literal)),
      optional(/[^\\]/)
    ),

    control_symbol: $ => seq(
      '\\', 
      field('name', $._static_uppercase_letter_literal),
    ),

    line_jump: $ => $._static_line_break,

    text: $ => field('text', $.static_text_literal),
  },
});

