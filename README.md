# hackforplayer
A player for hackforplay-embed in any website.


## Plan

https://trello.com/b/gxWQpAnW/opensource-hackforplay


## Example

1. Visit https://teramotodaiki.github.io/hackforplayer/

or

1. Clone this repo (or download zip)
2. Open *index.html* your browser **as local file**


## How to use

```html
<!-- Include library in <head> -->
<script async src="./hackforplayer.js" onload="h4p()"></script>

<!-- Put container element in <body> -->
<div class="h4p__container" data-target=".example1" data-main="hello-world"></div>

<!-- [data-main="hello-world"] means [alias="hello-world"] is entry point -->



<!-- Type javascript in inline tag -->
<script class="example1" alias="hello-world" type="hack">
// Type javascript here
alert('Hello World!');

// If dependencies needed...
require('module');
</script>

<!-- or include path (NEED ALLOW XHR!!) -->
<script class="example1" alias="module" src="./some/module.js" type="hack"></script>

```


## FAQ

- Why develop it for?
 - For education. Many contents are black box. We hope it makes Open and Programable. :-)
- Any examples?
 - Yes, but there're few contents. Please see [Open Index](https://teramotodaiki.github.io/open-index/)
- Why it can use `require` in browser?
 - Because `require.js` works in `iframe`. Automatically convert your module to AMD.
- What *include path (NEED ALLOW XHR!!)* means?
 - We want your module **as text** because make it programable!


## Why iframe?

It provides that **just local scope** can work javascript.
See more:

- https://github.com/teramotodaiki/hackforplay-embed
- https://github.com/teramotodaiki/hackforplay-editor


## Index of contents

https://teramotodaiki.github.io/open-index/

(in preparation)
