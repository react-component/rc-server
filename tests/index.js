require('./test.less');
require('bootstrap/dist/css/bootstrap.css');
var React = require('react');
require('react/addons');
React.render(<a href='#a'>a</a>, document.getElementById('__react-content'));
var div = document.createElement('div');
div.id = 'xx';
document.body.appendChild(div);
require('./render');

