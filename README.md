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
<!-- in <head></head> -->
<script async src="./hackforplayer.js" onload="h4p()"></script>
<script id="my-script-1" type="hack">
// Type javascript here
alert('Hello World!');
</script>

<!-- anywhere in body -->
<div class="h4p__container" data-target="#my-script-1"></div>
```

So an iframe will create and overlap .h4p__container div.
And an editor created too!


## How it works

Default code is written in
```html
<script id="script1" type="hack">...</script>
```

But **it works in the iframe**.


In the frame, you can use require.js


## Why iframe?

It provides that **just local scope** can work javascript.
See more:

https://github.com/teramotodaiki/hackforplay-embed
https://github.com/teramotodaiki/hackforplay-editor

