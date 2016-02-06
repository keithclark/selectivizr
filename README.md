<h1 align="center">Selectivizr 2</h1>
<p align="center">
  :sparkles: Now with maintenance! :sparkles:
</p>

### What happened to the old project?
[Keith Clark](https://github.com/keithclark) was eaten alive by sabre-tooth rattlesnakes or something. Who knows?

Good on him for originally inventing this though. :beers:

### Why support old IE?
Why completely turn your back on it? I'm not saying give it special attention (unless you're making a website for [the most populated country in the world](https://www.techinasia.com/windows-xp-now-dead-but-200-million-machines-in-china-still-using-it)), but why not toss some polyfills in conditional comments and at least give the poor bastards who are stuck on IE6-IE8 *something* to look at.

It requires almost 0 effort on your part and can make your website viewable to a lot of people.

### What is Selectivizr?
Selectivizr is a [polyfill](https://en.wikipedia.org/wiki/Polyfill) that makes IE6-8 work with most [CSS3 selectors](https://www.w3.org/TR/selectors/#selectors) (like `:nth-child`).

### Installation
- `bower install --save selectivizr2`

### Usage
To use the library, you'll need to include the [latest jQuery 1.x.x](https://jquery.com/download/).

Then add the following conditional comment **after** your stylesheets and jQuery:

```html
<!--[if lt IE 9]>
  <script src="selectivizr2.js"></script>
<![endif]-->
```

### Example

```html
<!doctype html>
<html>
  <head>
    <title>Selectivizr Test</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>

    <div>Hello World</div>

    <script src="http://code.jquery.com/jquery-1.12.0.min.js"></script>
    <!--[if lt IE 9]>
      <script src="selectivizr2.js"></script>
    <![endif]-->
  </body>
</html>
```

```css
div:nth-of-type(1) {
  background: blue;
}
```

That's it. That's how polyfills typically work. Load the .js and [bam](https://www.youtube.com/watch?v=8dxpMxULHnA)!

The only people downloading this file will be people below IE9. This means we're not punishing people using modern browsers.

### How can I test my site in IE7-IE8?
- Use a Virtual Machine
  - Learn how to install and setup VMs with [VirtualBox](https://www.virtualbox.org/). It's cross-platform and there are probably lots of [YouTube videos](https://www.youtube.com/results?search_query=virtualbox) on it so grab a :coffee: and enjoy.
  - Microsoft offers [Windows images](https://dev.windows.com/en-us/microsoft-edge/tools/vms) specifically so you can try out old browsers.
  - [IEVMS](https://github.com/xdissent/ievms) is the incredibly easy way to get/maintain these VMs.
- [BrowserStack](http://browserstack.com) is expensive and **slow**, but if you can't figure out the other techniques you can use it. I highly suggest you figure out how to use VMs though. It's a skill worth learning.

> I'm not even sure how to test in IE6 anymore, but... seriously?

### Why shouldn't I use X?
- `bower install selectivizr` installs Selectivizr 1.0.2. 1.0.2 sucks and doesn't work with a bunch of other tools like the wonderful [calc-polyfill](https://github.com/closingtag/calc-polyfill).
- https://github.com/keithclark/selectivizr is unmaintained.
- https://github.com/Mediamoose/selectivizr has issues closed and is broken on Bower.
- https://github.com/shinnn/lt-ie-9 is unmaintained and does more than just Selectivizr anyway.
- `bower install selectivizr-latest` was what this project was until I decided to actually maintain it.

### Contribute!
TBH, I'm not an amazing JS developer yet, so I really have no idea wtf is going on. I'm happy to merge stuff as long as it seems legit but I'm probably not going to spend a ton of time working on this codebase.
