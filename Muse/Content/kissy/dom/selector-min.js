/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 7 15:21
*/
KISSY.add("dom/selector/parser",function(){var l={},r=KISSY,g=function(d){this.rules=[];r.mix(this,d);this.resetInput(this.input)};g.prototype={constructor:function(d){this.rules=[];r.mix(this,d);this.resetInput(this.input)},resetInput:function(d){r.mix(this,{input:d,matched:"",stateStack:[g.STATIC.INITIAL],match:"",text:"",firstLine:1,lineNumber:1,lastLine:1,firstColumn:1,lastColumn:1})},getCurrentRules:function(){var d=this.stateStack[this.stateStack.length-1],e=[],d=this.mapState(d);r.each(this.rules,
function(f){var h=f.state||f[3];h?r.inArray(d,h)&&e.push(f):d==g.STATIC.INITIAL&&e.push(f)});return e},pushState:function(d){this.stateStack.push(d)},popState:function(){return this.stateStack.pop()},getStateStack:function(){return this.stateStack},showDebugInfo:function(){var d=g.STATIC.DEBUG_CONTEXT_LIMIT,e=this.matched,f=this.match,h=this.input,e=e.slice(0,e.length-f.length),e=(e.length>d?"...":"")+e.slice(-d).replace(/\n/," "),f=f+h,f=f.slice(0,d)+(f.length>d?"...":"");return e+f+"\n"+Array(e.length+
1).join("-")+"^"},mapSymbol:function(d){var e=this.symbolMap;return!e?d:e[d]||(e[d]=++this.symbolId)},mapReverseSymbol:function(d){var e=this.symbolMap,f,h=this.reverseSymbolMap;if(!h&&e)for(f in h=this.reverseSymbolMap={},e)h[e[f]]=f;return h?h[d]:d},mapState:function(d){var e=this.stateMap;return!e?d:e[d]||(e[d]=++this.stateId)},lex:function(){var d=this.input,e,f,h,y=this.getCurrentRules();this.match=this.text="";if(!d)return this.mapSymbol(g.STATIC.END_TAG);for(e=0;e<y.length;e++){f=y[e];var p=
f.token||f[0];h=f.action||f[2]||void 0;if(f=d.match(f.regexp||f[1])){if(e=f[0].match(/\n.*/g))this.lineNumber+=e.length;r.mix(this,{firstLine:this.lastLine,lastLine:this.lineNumber+1,firstColumn:this.lastColumn,lastColumn:e?e[e.length-1].length-1:this.lastColumn+f[0].length});e=this.match=f[0];this.matches=f;this.text=e;this.matched+=e;h=h&&h.call(this);h=void 0==h?p:this.mapSymbol(h);this.input=d=d.slice(e.length);return h?h:this.lex()}}}};g.STATIC={INITIAL:"I",DEBUG_CONTEXT_LIMIT:20,END_TAG:"$EOF"};
var v=new g({rules:[[2,/^\[(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[3,/^(?:[\t\r\n\f\x20]*)\]/,function(){this.text=KISSY.trim(this.text)}],[4,/^(?:[\t\r\n\f\x20]*)~=(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[5,/^(?:[\t\r\n\f\x20]*)\|=(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[6,/^(?:[\t\r\n\f\x20]*)\^=(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[7,/^(?:[\t\r\n\f\x20]*)\$=(?:[\t\r\n\f\x20]*)/,function(){this.text=
KISSY.trim(this.text)}],[8,/^(?:[\t\r\n\f\x20]*)\*=(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[9,/^(?:[\t\r\n\f\x20]*)\=(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[10,/^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)\(/,function(){this.text=KISSY.trim(this.text).slice(0,-1);this.pushState("fn")}],[11,/^[^\)]*/,function(){this.popState()},["fn"]],[12,/^(?:[\t\r\n\f\x20]*)\)/,function(){this.text=KISSY.trim(this.text)}],
[13,/^:not\((?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[14,/^(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/,function(){this.text=this.yy.unEscape(this.text)}],[15,/^"(\\"|[^"])*"/,function(){this.text=this.yy.unEscapeStr(this.text)}],[15,/^'(\\'|[^'])*'/,function(){this.text=this.yy.unEscapeStr(this.text)}],[16,/^#(?:(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))+)/,function(){this.text=this.yy.unEscape(this.text.slice(1))}],
[17,/^\.(?:(?:[\w]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))(?:[\w\d-]|[^\x00-\xa0]|(?:\\[^\n\r\f0-9a-f]))*)/,function(){this.text=this.yy.unEscape(this.text.slice(1))}],[18,/^(?:[\t\r\n\f\x20]*),(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[19,/^::?/,0],[20,/^(?:[\t\r\n\f\x20]*)\+(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[21,/^(?:[\t\r\n\f\x20]*)>(?:[\t\r\n\f\x20]*)/,function(){this.text=KISSY.trim(this.text)}],[22,/^(?:[\t\r\n\f\x20]*)~(?:[\t\r\n\f\x20]*)/,
function(){this.text=KISSY.trim(this.text)}],[23,/^\*/,0],[24,/^(?:[\t\r\n\f\x20]+)/,0],[25,/^./,0]]});l.lexer=v;v.symbolMap={$EOF:1,LEFT_BRACKET:2,RIGHT_BRACKET:3,INCLUDES:4,DASH_MATCH:5,PREFIX_MATCH:6,SUFFIX_MATCH:7,SUBSTRING_MATCH:8,ALL_MATCH:9,FUNCTION:10,PARAMETER:11,RIGHT_PARENTHESES:12,NOT:13,IDENT:14,STRING:15,HASH:16,CLASS:17,COMMA:18,COLON:19,PLUS:20,GREATER:21,TILDE:22,UNIVERSAL:23,S:24,INVALID:25,$START:26,selectors_group:27,selector:28,simple_selector_sequence:29,combinator:30,type_selector:31,
id_selector:32,class_selector:33,attrib_match:34,attrib:35,attrib_val:36,pseudo:37,negation:38,negation_arg:39,suffix_selector:40,suffix_selectors:41};l.productions=[[26,[27]],[27,[28],function(){return[this.$1]}],[27,[27,18,28],function(){this.$1.push(this.$3)}],[28,[29]],[28,[28,30,29],function(){this.$1.nextCombinator=this.$3.prevCombinator=this.$2;this.$3.order=(this.$1.order=this.$1.order||0)+1;this.$3.prev=this.$1;return this.$1.next=this.$3}],[30,[20]],[30,[21]],[30,[22]],[30,[24],function(){return" "}],
[31,[14],function(){return{t:"tag",value:this.$1}}],[31,[23],function(){return{t:"tag",value:this.$1}}],[32,[16],function(){return{t:"id",value:this.$1}}],[33,[17],function(){return{t:"cls",value:this.$1}}],[34,[6]],[34,[7]],[34,[8]],[34,[9]],[34,[4]],[34,[5]],[35,[2,14,3],function(){return{t:"attrib",value:{ident:this.$2}}}],[36,[14]],[36,[15]],[35,[2,14,34,36,3],function(){return{t:"attrib",value:{ident:this.$2,match:this.$3,value:this.$4}}}],[37,[19,10,11,12],function(){return{t:"pseudo",value:{fn:this.$2.toLowerCase(),
param:this.$3}}}],[37,[19,14],function(){return{t:"pseudo",value:{ident:this.$2.toLowerCase()}}}],[38,[13,39,12],function(){return{t:"pseudo",value:{fn:"not",param:this.$2}}}],[39,[31]],[39,[32]],[39,[33]],[39,[35]],[39,[37]],[40,[32]],[40,[33]],[40,[35]],[40,[37]],[40,[38]],[41,[40],function(){return[this.$1]}],[41,[41,40],function(){this.$1.push(this.$2)}],[29,[31]],[29,[41],function(){return{suffix:this.$1}}],[29,[31,41],function(){return{t:"tag",value:this.$1.value,suffix:this.$2}}]];l.table=
{gotos:{"0":{27:8,28:9,29:10,31:11,32:12,33:13,35:14,37:15,38:16,40:17,41:18},2:{31:20,32:21,33:22,35:23,37:24,39:25},9:{30:33},11:{32:12,33:13,35:14,37:15,38:16,40:17,41:34},18:{32:12,33:13,35:14,37:15,38:16,40:35},19:{34:43},28:{28:46,29:10,31:11,32:12,33:13,35:14,37:15,38:16,40:17,41:18},33:{29:47,31:11,32:12,33:13,35:14,37:15,38:16,40:17,41:18},34:{32:12,33:13,35:14,37:15,38:16,40:35},43:{36:50},46:{30:33}},action:{"0":{2:[1,0,1],13:[1,0,2],14:[1,0,3],16:[1,0,4],17:[1,0,5],19:[1,0,6],23:[1,0,
7]},1:{14:[1,0,19]},2:{2:[1,0,1],14:[1,0,3],16:[1,0,4],17:[1,0,5],19:[1,0,6],23:[1,0,7]},3:{1:[2,9,0],2:[2,9,0],12:[2,9,0],13:[2,9,0],16:[2,9,0],17:[2,9,0],18:[2,9,0],19:[2,9,0],20:[2,9,0],21:[2,9,0],22:[2,9,0],24:[2,9,0]},4:{1:[2,11,0],2:[2,11,0],12:[2,11,0],13:[2,11,0],16:[2,11,0],17:[2,11,0],18:[2,11,0],19:[2,11,0],20:[2,11,0],21:[2,11,0],22:[2,11,0],24:[2,11,0]},5:{1:[2,12,0],2:[2,12,0],12:[2,12,0],13:[2,12,0],16:[2,12,0],17:[2,12,0],18:[2,12,0],19:[2,12,0],20:[2,12,0],21:[2,12,0],22:[2,12,0],
24:[2,12,0]},6:{10:[1,0,26],14:[1,0,27]},7:{1:[2,10,0],2:[2,10,0],12:[2,10,0],13:[2,10,0],16:[2,10,0],17:[2,10,0],18:[2,10,0],19:[2,10,0],20:[2,10,0],21:[2,10,0],22:[2,10,0],24:[2,10,0]},8:{1:[0,0,0],18:[1,0,28]},9:{1:[2,1,0],18:[2,1,0],20:[1,0,29],21:[1,0,30],22:[1,0,31],24:[1,0,32]},10:{1:[2,3,0],18:[2,3,0],20:[2,3,0],21:[2,3,0],22:[2,3,0],24:[2,3,0]},11:{1:[2,38,0],2:[1,0,1],13:[1,0,2],16:[1,0,4],17:[1,0,5],18:[2,38,0],19:[1,0,6],20:[2,38,0],21:[2,38,0],22:[2,38,0],24:[2,38,0]},12:{1:[2,31,0],
2:[2,31,0],13:[2,31,0],16:[2,31,0],17:[2,31,0],18:[2,31,0],19:[2,31,0],20:[2,31,0],21:[2,31,0],22:[2,31,0],24:[2,31,0]},13:{1:[2,32,0],2:[2,32,0],13:[2,32,0],16:[2,32,0],17:[2,32,0],18:[2,32,0],19:[2,32,0],20:[2,32,0],21:[2,32,0],22:[2,32,0],24:[2,32,0]},14:{1:[2,33,0],2:[2,33,0],13:[2,33,0],16:[2,33,0],17:[2,33,0],18:[2,33,0],19:[2,33,0],20:[2,33,0],21:[2,33,0],22:[2,33,0],24:[2,33,0]},15:{1:[2,34,0],2:[2,34,0],13:[2,34,0],16:[2,34,0],17:[2,34,0],18:[2,34,0],19:[2,34,0],20:[2,34,0],21:[2,34,0],22:[2,
34,0],24:[2,34,0]},16:{1:[2,35,0],2:[2,35,0],13:[2,35,0],16:[2,35,0],17:[2,35,0],18:[2,35,0],19:[2,35,0],20:[2,35,0],21:[2,35,0],22:[2,35,0],24:[2,35,0]},17:{1:[2,36,0],2:[2,36,0],13:[2,36,0],16:[2,36,0],17:[2,36,0],18:[2,36,0],19:[2,36,0],20:[2,36,0],21:[2,36,0],22:[2,36,0],24:[2,36,0]},18:{1:[2,39,0],2:[1,0,1],13:[1,0,2],16:[1,0,4],17:[1,0,5],18:[2,39,0],19:[1,0,6],20:[2,39,0],21:[2,39,0],22:[2,39,0],24:[2,39,0]},19:{3:[1,0,36],4:[1,0,37],5:[1,0,38],6:[1,0,39],7:[1,0,40],8:[1,0,41],9:[1,0,42]},
20:{12:[2,26,0]},21:{12:[2,27,0]},22:{12:[2,28,0]},23:{12:[2,29,0]},24:{12:[2,30,0]},25:{12:[1,0,44]},26:{11:[1,0,45]},27:{1:[2,24,0],2:[2,24,0],12:[2,24,0],13:[2,24,0],16:[2,24,0],17:[2,24,0],18:[2,24,0],19:[2,24,0],20:[2,24,0],21:[2,24,0],22:[2,24,0],24:[2,24,0]},28:{2:[1,0,1],13:[1,0,2],14:[1,0,3],16:[1,0,4],17:[1,0,5],19:[1,0,6],23:[1,0,7]},29:{2:[2,5,0],13:[2,5,0],14:[2,5,0],16:[2,5,0],17:[2,5,0],19:[2,5,0],23:[2,5,0]},30:{2:[2,6,0],13:[2,6,0],14:[2,6,0],16:[2,6,0],17:[2,6,0],19:[2,6,0],23:[2,
6,0]},31:{2:[2,7,0],13:[2,7,0],14:[2,7,0],16:[2,7,0],17:[2,7,0],19:[2,7,0],23:[2,7,0]},32:{2:[2,8,0],13:[2,8,0],14:[2,8,0],16:[2,8,0],17:[2,8,0],19:[2,8,0],23:[2,8,0]},33:{2:[1,0,1],13:[1,0,2],14:[1,0,3],16:[1,0,4],17:[1,0,5],19:[1,0,6],23:[1,0,7]},34:{1:[2,40,0],2:[1,0,1],13:[1,0,2],16:[1,0,4],17:[1,0,5],18:[2,40,0],19:[1,0,6],20:[2,40,0],21:[2,40,0],22:[2,40,0],24:[2,40,0]},35:{1:[2,37,0],2:[2,37,0],13:[2,37,0],16:[2,37,0],17:[2,37,0],18:[2,37,0],19:[2,37,0],20:[2,37,0],21:[2,37,0],22:[2,37,0],
24:[2,37,0]},36:{1:[2,19,0],2:[2,19,0],12:[2,19,0],13:[2,19,0],16:[2,19,0],17:[2,19,0],18:[2,19,0],19:[2,19,0],20:[2,19,0],21:[2,19,0],22:[2,19,0],24:[2,19,0]},37:{14:[2,17,0],15:[2,17,0]},38:{14:[2,18,0],15:[2,18,0]},39:{14:[2,13,0],15:[2,13,0]},40:{14:[2,14,0],15:[2,14,0]},41:{14:[2,15,0],15:[2,15,0]},42:{14:[2,16,0],15:[2,16,0]},43:{14:[1,0,48],15:[1,0,49]},44:{1:[2,25,0],2:[2,25,0],13:[2,25,0],16:[2,25,0],17:[2,25,0],18:[2,25,0],19:[2,25,0],20:[2,25,0],21:[2,25,0],22:[2,25,0],24:[2,25,0]},45:{12:[1,
0,51]},46:{1:[2,2,0],18:[2,2,0],20:[1,0,29],21:[1,0,30],22:[1,0,31],24:[1,0,32]},47:{1:[2,4,0],18:[2,4,0],20:[2,4,0],21:[2,4,0],22:[2,4,0],24:[2,4,0]},48:{3:[2,20,0]},49:{3:[2,21,0]},50:{3:[1,0,52]},51:{1:[2,23,0],2:[2,23,0],12:[2,23,0],13:[2,23,0],16:[2,23,0],17:[2,23,0],18:[2,23,0],19:[2,23,0],20:[2,23,0],21:[2,23,0],22:[2,23,0],24:[2,23,0]},52:{1:[2,22,0],2:[2,22,0],12:[2,22,0],13:[2,22,0],16:[2,22,0],17:[2,22,0],18:[2,22,0],19:[2,22,0],20:[2,22,0],21:[2,22,0],22:[2,22,0],24:[2,22,0]}}};l.parse=
function(d){var e=this,f=e.lexer,h,g,p=e.table,l=p.gotos,p=p.action,v=e.productions,o=[null],m=[0];for(f.resetInput(d);;){d=m[m.length-1];h||(h=f.lex());if(!h)return!1;g=p[d]&&p[d][h];if(!g){var u=[];p[d]&&r.each(p[d],function(d,f){u.push(e.lexer.mapReverseSymbol(f))});f.showDebugInfo();u.join(", ");return!1}switch(g[0]){case 1:m.push(h);o.push(f.text);m.push(g[2]);h=null;break;case 2:var j=v[g[1]],d=j.symbol||j[0];g=j.action||j[2];var s=(j.rhs||j[1]).length,t=0,w=void 0,j=o[o.length-s];for(e.$$=
j;t<s;t++)e["$"+(s-t)]=o[o.length-1-t];g&&(w=g.call(e));j=void 0!==w?w:e.$$;s&&(m=m.slice(0,-2*s),o=o.slice(0,-1*s));m.push(d);o.push(j);m.push(l[m[m.length-2]][m[m.length-1]]);break;case 0:return j}}};return l});
KISSY.add("dom/selector",function(l,r,g){function v(a){return a.replace(H,I)}function d(a,b){do a=a[b];while(a&&1!=a.nodeType);return a}function e(a,b){for(var c=b.getElementsByTagName(a),e="*"==a,d=[],f=0,h;h=c[f++];)(!e||1===h.nodeType)&&d.push(h);return d}function f(a){var b=0,c=0;if("number"==typeof a)c=a;else if("odd"==a)b=2,c=1;else if("even"==a)b=2,c=0;else if(a=a.replace(/\s/g,"").match(J))a[1]?(b=parseInt(a[2]),isNaN(b)&&(b="-"==a[2]?-1:1)):b=0,c=parseInt(a[3])||0;return{a:b,b:c}}function h(a,
b,c,d){if(0==b){if(a==c)return d}else if(0<=(a-c)/b&&0==(a-c)%b&&d)return 1}function y(a,b){return g._selectInternal(a,null,b)}function p(a,b){if(!b)return!0;if(!a||9===a.nodeType)return!1;var c=1,d=b.suffix,e,f;"tag"==b.t&&(c&=E.tag(a,b.value));if(c&&d){e=d.length;for(f=0;c&&f<e;f++){var h=d[f],i=h.t;E[i]&&(c&=E[i](a,h.value))}}return c}function G(a,b){var c=1,e=a,f,h=b;do if(c&=p(a,b)){b=b&&b.prev;if(!b)return!0;f=B[b.nextCombinator];a=d(a,f.dir);if(!f.immediate)return{el:a,match:b}}else if(f=B[b.nextCombinator],
f.immediate)break;else return{el:a&&d(a,f.dir),match:b};while(a);return{el:d(e,B[h.nextCombinator].dir),match:h}}function F(a,b){var c;if(t){if(!(c=a.getAttribute(j)))a.setAttribute(j,c=+new Date+"_"+ ++w)}else if(!(c=a[j]))c=a[j]=+new Date+"_"+ ++w;c=c+"_"+(b.order||0);return c in D?D[c]:D[c]=o(a,b)}function o(a,b){var c=G(a,b);if(!0===c)return!0;a=c.el;for(b=c.match;a;){if(F(a,b))return!0;a=d(a,B[b.nextCombinator].dir)}return!1}function m(a,b,c){s[a]||(s[a]=r.parse(a));var a=s[a],f=0,h=a.length,
q,A=[];c&&(b=b||c[0].ownerDocument);for(t=(q=(b=b||u)&&(b.ownerDocument||b).documentElement)?"html"!==q.nodeName.toLowerCase():!1;f<h;f++){D={};q=a[f];var i=q.suffix,k,n,j,m=c;j=null;if(!m){if(i&&!t){k=0;for(n=i.length;k<n;k++){var l=i[k];if("id"==l.t){j=l.value;break}}}if(j)if(i=(k=b!=u&&!g._contains(u,b))?null:u.getElementById(j),k||z(i,"id")!=j){k=e("*",b);n=k.length;for(l=0;l<n;l++)if(i=k[l],z(i,"id")==j){m=[i];break}l===n&&(m=[])}else b!==u&&i&&(i=g._contains(b,i)?i:null),m=i?[i]:[];else m=e(q.value||
"*",b)}j=0;if(i=m.length)for(;j<i;j++){k=m[j];a:{n=k;var l=void 0,o=q;do{if(!p(n,o)){n=null;break a}o=o.prev;if(!o){n=!0;break a}l=B[o.nextCombinator];n=d(n,l.dir)}while(n&&l.immediate);n=!n?null:{el:n,match:o}}!0===n?A.push(k):n&&F(n.el,n.match)&&A.push(k)}}1<h&&(A=g.unique(A));return A}var u=l.Env.host.document,j="_ks_data_selector_id_",s={},t,w=0,D={},z=g._getAttr,K=g._hasSingleClass,L=g._isTag,J=/^(([+-]?(?:\d+)?)?n)?([+-]?\d+)?$/,H=/\\([\da-fA-F]{1,6}[\x20\t\r\n\f]?|.)/g,I=function(a,b){var c=
"0x"+b-65536;return isNaN(c)?b:0>c?String.fromCharCode(c+65536):String.fromCharCode(c>>10|55296,c&1023|56320)};r.lexer.yy={unEscape:v,unEscapeStr:function(a){return this.unEscape(a.slice(1,-1))}};var C={"nth-child":function(a,b){var c=f(b),d=c.a,c=c.b;if(0==d&&0==c)return 0;var e=0,q=a.parentNode;if(q)for(var q=q.childNodes,g=0,i,k=q.length;g<k;g++)if(i=q[g],1==i.nodeType&&e++,i=h(e,d,c,i===a),void 0!==i)return i;return 0},"nth-last-child":function(a,b){var c=f(b),d=c.a,c=c.b;if(0==d&&0==c)return 0;
var e=0,g=a.parentNode;if(g)for(var g=g.childNodes,j=g.length-1,i;0<=j;j--)if(i=g[j],1==i.nodeType&&e++,i=h(e,d,c,i===a),void 0!==i)return i;return 0},"nth-of-type":function(a,b){var c=f(b),d=c.a,c=c.b;if(0==d&&0==c)return 0;var e=0,g=a.parentNode;if(g)for(var g=g.childNodes,j=a.tagName,i=0,k,l=g.length;i<l;i++)if(k=g[i],k.tagName==j&&e++,k=h(e,d,c,k===a),void 0!==k)return k;return 0},"nth-last-of-type":function(a,b){var c=f(b),d=c.a,c=c.b;if(0==d&&0==c)return 0;var e=0,g=a.parentNode;if(g)for(var g=
g.childNodes,j=a.tagName,i=g.length-1,k;0<=i;i--)if(k=g[i],k.tagName==j&&e++,k=h(e,d,c,k===a),void 0!==k)return k;return 0},lang:function(a,b){var c,b=v(b.toLowerCase());do if(c=t?a.getAttribute("xml:lang")||a.getAttribute("lang"):a.lang)return c=c.toLowerCase(),c===b||0===c.indexOf(b+"-");while((a=a.parentNode)&&1===a.nodeType);return!1},not:function(a,b){return!E[b.t](a,b.value)}},x={empty:function(a){for(var a=a.childNodes,b=0,c=a.length-1,d;b<c;b++)if(d=a[b],d=d.nodeType,1==d||3==d||4==d||5==
d)return 0;return 1},root:function(a){return a===a.ownerDocument.documentElement},"first-child":function(a){return C["nth-child"](a,1)},"last-child":function(a){return C["nth-last-child"](a,1)},"first-of-type":function(a){return C["nth-of-type"](a,1)},"last-of-type":function(a){return C["nth-last-of-type"](a,1)},"only-child":function(a){return x["first-child"](a)&&x["last-child"](a)},"only-of-type":function(a){return x["first-of-type"](a)&&x["last-of-type"](a)},focus:function(a){var b=a.ownerDocument;
return a===b.activeElement&&(!b.hasFocus||b.hasFocus())&&!(!a.type&&!(a.href||0<=a.tabIndex))},target:function(a){var b=location.hash;return b&&b.slice(1)===z(a,"id")},enabled:function(a){return!a.disabled},disabled:function(a){return a.disabled},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&a.checked||"option"===b&&a.selected}},M={"~=":function(a,b){return!b||-1<b.indexOf(" ")?0:-1!=(" "+a+" ").indexOf(" "+b+" ")},"|=":function(a,b){return-1!=(" "+a).indexOf(" "+b+"-")},"^=":function(a,
b){return b&&l.startsWith(a,b)},"$=":function(a,b){return b&&l.endsWith(a,b)},"*=":function(a,b){return b&&-1!=a.indexOf(b)},"=":function(a,b){return a===b}},E={tag:L,cls:K,id:function(a,b){return z(a,"id")===b},attrib:function(a,b){var c=b.ident;t||(c=c.toLowerCase());var c=z(a,c),d=b.match;if(!d&&void 0!==c)return 1;if(d){if(void 0===c)return 0;if(d=M[d])return d(c+"",b.value+"")}return 0},pseudo:function(a,b){var c,d;if(d=b.fn){if(!(c=C[d]))throw new SyntaxError("Syntax error: not support pseudo: "+
d);return c(a,b.param)}if(c=b.ident){if(!x[c])throw new SyntaxError("Syntax error: not support pseudo: "+c);return x[c](a)}return 0}},B={">":{dir:"parentNode",immediate:1}," ":{dir:"parentNode"},"+":{dir:"previousSibling",immediate:1},"~":{dir:"previousSibling"}};"sourceIndex"in u.documentElement&&(g._compareNodeOrder=function(a,b){return a.sourceIndex-b.sourceIndex});g._matchesInternal=y;g._selectInternal=m;return{select:m,matches:y}},{requires:["./selector/parser","dom/base","dom/ie"]});
