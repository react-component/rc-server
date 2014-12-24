# test
```js

alert(1)

```

````js
if(window.seajs){
    window.require = window.seajs.use;
}
````

````html
<div id='react-content'></div>
````

````js
require(['react'], function(React){
var x = <a href='#a'>a</a>;
React.render(x, document.getElementById('react-content'));
});
````

```html
<b>1</b>
```

````html
<b>2</b>
````