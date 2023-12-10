/*
  Набор утилит, главным образом для DOM-манипуляций (дешевая замена jQuery)
*/

const injector = {
  inject: function(alias, css, position="beforeend") {
  var id = `injector:${alias}`
  var existing = document.getElementById(id)
  if(existing) {
    existing.innerHTML = css
    return
  }
  var head = document.head || document.getElementsByTagName('head')[0]
  head.insertAdjacentHTML(position, `<style type="text/css" id="${id}">${css}</style>`)
  },
  remove: function(alias) {
  var id = `injector:${alias}`
  var style = document.getElementById(id)
  if (style) {
    var head = document.head || document.getElementsByTagName('head')[0]
    if(head)
      head.removeChild(document.getElementById(id))
    }
  }
}
// Shorthands 
const $ = sel => document.querySelector(sel)
const $$ = (sel, context=document) => Array.from(context.querySelectorAll(sel))
window.Element.prototype._$ = function(sel) { // barbaric yet effective
  return this.querySelector(sel)
}
window.Element.prototype._$$ = function(sel) {
  return $$(sel, this)
}

// Insert adjacent HTML and immediately return the inserted element
window.Element.prototype._ins = function(position, html) {
  let shortHandMap = {
    '<*': 'afterbegin',
    '*>': 'beforeend',
    '*<': 'beforebegin',
    '>*': 'afterend'
  }
  if (position in shortHandMap) {
    position = shortHandMap[position]
  }
  this.insertAdjacentHTML(position, html)
  position = position.toLowerCase()
  if (position == 'afterbegin')
    return this.firstElementChild
  else if (position == 'beforeend')
    return this.lastElementChild
  else if (position == 'beforebegin')
    return this.previousElementSibling
  else if (position == 'afterend')
    return this.nextElementSibling
}

window.EventTarget.prototype.delegateEventListener = function(types, targetSelectors, listener, options) {
  if (! (targetSelectors instanceof Array))
    targetSelectors = [targetSelectors]
  this.addMultiEventListener(types, ev => {
    targetSelectors.some(selector => {
      if (ev.target.matches(selector)) {
        listener.bind(ev.target)(ev)
        return true
      }
    })
  }, options)
}
window.EventTarget.prototype.addMultiEventListener = function(types, listener, options) {
  if (! (types instanceof Array))
    types = types.split(' ')
  types.forEach(type => {
    this.addEventListener(type, ev => {
      listener.bind(ev.target)(ev)
    }, options)
  })
}

;[window.Element.prototype, window.Text.prototype].forEach(e => {
  e.matches || (e.matches=e.matchesSelector || function(selector) {
    var matches = document.querySelectorAll(selector)
    return Array.prototype.some.call(matches, e => {
       return e === this
    })
  })
  e.findParent = function(selector) {
    let node = this
    while(node && !node.matches(selector)) {
      node = node.parentNode
      if (! node.matches) return null;
    }
    return node
  }
})

window.Element.prototype.toggleBooleanAttribute = function(attr, toggle) {
  if (typeof toggle == 'undefined')
    toggle = !this.getAttribute(attr)
  if (toggle)
    this.setAttribute(attr, true)
  else 
    this.removeAttribute(attr)
}

function sleep(ms) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms)
  })
}

Number.prototype.toPadded = function(len) {
  let str = this.toString()
  const ch = len - str.length
  if (ch > 0) {
    str = '0'.repeat(ch) + str
  }
  return str
}

function setRootVar(name, val) {
  document.documentElement.style.setProperty(`--${name}`, val)
}
