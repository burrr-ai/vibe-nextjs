/**
 * ESLint rule to enforce createParallelAction / resolveActions usage
 *
 * 1. In src/services/{service}/api/{domain}/actions/*.ts:
 *    - All exported functions must be wrapped with createParallelAction
 *    - createParallelAction must be imported from '@/lib/utils'
 *    - Cross-action imports forbidden
 *
 * 2. Everywhere else:
 *    - createParallelAction / resolveActions import 금지
 *    (api layer 전용 — auth, state, page 등에서 사용 불가)
 */

const RESTRICTED_NAMES = ['createParallelAction', 'resolveActions'];

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce createParallelAction wrapping for server actions',
      category: 'Best Practices',
      recommended: true,
    },
    messages: {
      mustWrapWithParallel:
        'Exported server action "{{name}}" must be wrapped with createParallelAction (see src/services/api.ai.md)',
      missingParallelImport:
        'Server action file must import createParallelAction from "@/lib/utils" (see src/services/api.ai.md)',
      noCrossActionImport:
        'Action 파일 간 크로스 import 금지. DB 접근은 repository를 통해 각각 구현하고, 공통 로직은 유틸로 분리하세요 (see src/services/api.ai.md)',
      noParallelOutsideApi:
        '"{{name}}"은 src/services/{service}/api/ 내에서만 사용 가능합니다 (see src/services/api.ai.md)',
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();
    const normalizedPath = filename.replace(/\\/g, '/');

    // --- Check 1: files inside actions/ ---
    const actionsMatch = normalizedPath.match(
      /src\/services\/[^/]+\/api\/[^/]+\/actions\/.*\.ts$/
    );

    // --- Check 2: files inside api/{domain}/index.ts (resolveActions allowed) ---
    const apiIndexMatch = normalizedPath.match(
      /src\/services\/[^/]+\/api\/[^/]+\/index\.ts$/
    );

    // --- Check 3: files OUTSIDE api/ should NOT import these ---
    const insideApi = normalizedPath.match(
      /src\/services\/[^/]+\/api\//
    );

    // Outside api/ — block createParallelAction / resolveActions imports
    if (!insideApi) {
      return {
        ImportDeclaration(node) {
          if (!node.source) return;
          for (const spec of node.specifiers) {
            if (
              spec.type === 'ImportSpecifier' &&
              RESTRICTED_NAMES.includes(spec.imported?.name)
            ) {
              context.report({
                node: spec,
                messageId: 'noParallelOutsideApi',
                data: { name: spec.imported.name },
              });
            }
          }
        },
      };
    }

    // api/index.ts — no extra checks needed (api-structure handles it)
    if (apiIndexMatch && !actionsMatch) return {};

    // Not in actions/ — no extra checks
    if (!actionsMatch) return {};

    // --- actions/*.ts enforcement ---
    let hasParallelImport = false;
    let hasExports = false;

    return {
      ImportDeclaration(node) {
        if (!node.source) return;
        const src = node.source.value;

        // Check for import { createParallelAction } from '@/lib/utils'
        if (src === '@/lib/utils' || src === '@/lib/utils/parallel-action') {
          for (const spec of node.specifiers) {
            if (
              spec.type === 'ImportSpecifier' &&
              spec.imported?.name === 'createParallelAction'
            ) {
              hasParallelImport = true;
            }
          }
        }

        // Forbid cross-action imports (relative imports within actions/)
        if (src.startsWith('./') || src.startsWith('../')) {
          const isRelativeToSibling = src.startsWith('./') && !src.startsWith('./types');
          const isParentActions = src.startsWith('../') && src.includes('actions');
          if (isRelativeToSibling || isParentActions) {
            context.report({
              node,
              messageId: 'noCrossActionImport',
            });
          }
        }
      },

      ExportNamedDeclaration(node) {
        // export function foo() {} — must be wrapped, not raw
        if (node.declaration?.type === 'FunctionDeclaration') {
          hasExports = true;
          context.report({
            node: node.declaration,
            messageId: 'mustWrapWithParallel',
            data: { name: node.declaration.id?.name || 'anonymous' },
          });
        }

        // export const foo = ...
        if (node.declaration?.type === 'VariableDeclaration') {
          for (const declarator of node.declaration.declarations) {
            const init = declarator.init;
            const name = declarator.id?.name || 'unknown';

            hasExports = true;

            // createParallelAction(...) — OK
            if (
              init?.type === 'CallExpression' &&
              init.callee?.type === 'Identifier' &&
              init.callee.name === 'createParallelAction'
            ) {
              continue;
            }

            // Anything else (raw arrow, raw function, identifier) — ERROR
            if (init?.type === 'ArrowFunctionExpression' || init?.type === 'FunctionExpression') {
              context.report({
                node: declarator,
                messageId: 'mustWrapWithParallel',
                data: { name },
              });
            }
          }
        }
      },

      ExportDefaultDeclaration(node) {
        hasExports = true;
        const decl = node.declaration;
        if (
          decl.type === 'FunctionDeclaration' ||
          decl.type === 'ArrowFunctionExpression' ||
          decl.type === 'FunctionExpression'
        ) {
          context.report({
            node: decl,
            messageId: 'mustWrapWithParallel',
            data: { name: decl.id?.name || 'default' },
          });
        }
      },

      'Program:exit'(node) {
        if (hasExports && !hasParallelImport) {
          context.report({
            node,
            messageId: 'missingParallelImport',
          });
        }
      },
    };
  },
};
