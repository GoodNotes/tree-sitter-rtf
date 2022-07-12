#if defined(__GNUC__) || defined(__clang__)
#pragma GCC diagnostic push
#pragma GCC diagnostic ignored "-Wmissing-field-initializers"
#endif

#ifndef TSLanguage
#define TSLanguage void
#endif

__attribute__((weak))
TSLanguage *tree_sitter_rtf(void) {
    return 0;
}