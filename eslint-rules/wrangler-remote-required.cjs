/**
 * ESLint rule: wrangler-remote-required
 *
 * wrangler.jsonc에서 d1_databases나 r2_buckets가 있으면
 * 각 항목에 remote: true가 반드시 있어야 함
 *
 * - 연동 안 됨 (배열 없음): OK
 * - 연동 됨 (배열 있음): remote: true 필수
 */

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require remote: true in wrangler.jsonc d1_databases and r2_buckets',
      category: 'Possible Errors',
    },
    fixable: 'code',
    schema: [],
    messages: {
      missingRemote: '{{binding}} 바인딩에 "remote": true가 필요합니다. 개발 환경에서 리모트 DB/Storage에 연결하려면 이 설정이 필수입니다.',
      remoteNotTrue: '{{binding}} 바인딩의 "remote" 값이 true가 아닙니다. 리모트 연결을 위해 true로 설정하세요.',
    },
  },

  create(context) {
    const filename = context.getFilename ? context.getFilename() : context.filename;

    // wrangler.jsonc 파일만 검사
    if (!filename.endsWith('wrangler.jsonc')) {
      return {};
    }

    return {
      // JSON 객체의 속성을 순회
      JSONProperty(node) {
        const key = node.key.value || node.key.name;

        // d1_databases 또는 r2_buckets 배열인지 확인
        if (key !== 'd1_databases' && key !== 'r2_buckets') {
          return;
        }

        // 값이 배열인지 확인
        if (node.value.type !== 'JSONArrayExpression') {
          return;
        }

        const bindingType = key === 'd1_databases' ? 'D1 Database' : 'R2 Bucket';

        // 배열의 각 요소 검사
        node.value.elements.forEach((element, index) => {
          if (element.type !== 'JSONObjectExpression') {
            return;
          }

          // binding 이름 찾기
          let bindingName = `${bindingType} [${index}]`;
          const bindingProp = element.properties.find(
            p => (p.key.value || p.key.name) === 'binding'
          );
          if (bindingProp && bindingProp.value.value) {
            bindingName = `${bindingType} "${bindingProp.value.value}"`;
          }

          // remote 속성 찾기
          const remoteProp = element.properties.find(
            p => (p.key.value || p.key.name) === 'remote'
          );

          if (!remoteProp) {
            // remote 속성이 없음
            context.report({
              node: element,
              messageId: 'missingRemote',
              data: { binding: bindingName },
              fix(fixer) {
                // 마지막 속성 뒤에 remote: true 추가
                const lastProp = element.properties[element.properties.length - 1];
                if (lastProp) {
                  return fixer.insertTextAfter(lastProp, ',\n\t\t\t"remote": true');
                }
                return null;
              },
            });
          } else if (remoteProp.value.value !== true) {
            // remote가 있지만 true가 아님
            context.report({
              node: remoteProp,
              messageId: 'remoteNotTrue',
              data: { binding: bindingName },
              fix(fixer) {
                return fixer.replaceText(remoteProp.value, 'true');
              },
            });
          }
        });
      },
    };
  },
};
