/**
 * ESLint rule: disallow direct comwit imports
 *
 * Direct use of comwit is allowed only in:
 * - src/state/**
 * - src/lib/state/**
 */

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow direct comwit imports outside the state layer",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDirectComwit:
        'Do not import from "comwit" directly here. Keep state-layer boundaries in src/state/* and src/lib/state/*. (see src/services/state.ai.md)',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();
    const normalizedPath = filename.replace(/\\/g, "/");
    const isAllowed =
      normalizedPath.includes("/src/state/") ||
      normalizedPath.includes("/src/lib/state/") ||
      /\/src\/services\/[^/]+\/state\//.test(normalizedPath);

    if (isAllowed) return {};

    return {
      ImportDeclaration(node) {
        const source = node.source.value;

        if (
          typeof source === "string" &&
          (source === "comwit" || source.startsWith("comwit/"))
        ) {
          context.report({
            node,
            messageId: "noDirectComwit",
          });
        }
      },
    };
  },
};
