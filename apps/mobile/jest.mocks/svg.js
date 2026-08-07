// O react-native-svg-transformer roda no Metro, nao no Jest. Sem este mock,
// qualquer arvore que importe um .svg quebra nos testes.
const React = require("react");

module.exports = {
  __esModule: true,
  default: (props) => React.createElement("SvgMock", props),
};
