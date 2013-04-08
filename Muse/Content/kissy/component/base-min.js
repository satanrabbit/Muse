/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 8 00:14
*/
KISSY.add("component/base",function(c,f,d,b,h,a,e,i){c.mix(f,{Controller:d,Render:b,Container:h,DelegateChildren:a,DecorateChild:i,DecorateChildren:e});return f},{requires:"./base/impl,./base/controller,./base/render,./base/container,./base/delegate-children,./base/decorate-children,./base/decorate-child".split(",")});
KISSY.add("component/base/box-render",function(c){function f(){}var d=c.all,b=c.UA,h=c.Env.host.document;f.ATTRS={el:{},elCls:{},elStyle:{},width:{},height:{},elAttrs:{},content:{},elBefore:{},render:{},visible:{},contentEl:{valueFn:function(){return this.get("el")}}};f.HTML_PARSER={el:function(a){return a},content:function(a){return(this.get("contentEl")||a).html()}};f.prototype={__createDom:function(){var a,e=this.getCssClassWithState(),b;(a=this.get("srcNode"))?a.addClass(e):(b=this.get("contentEl"),
a=d(c.substitute('<div class="{cls}"></div>',{cls:e})),b&&a.append(b),this.setInternal("el",a),b||this.setInternal("contentEl",a))},__renderUI:function(){if(!this.get("srcNode")){var a=this.get("render"),b=this.get("el"),i=this.get("elBefore");i?b.insertBefore(i,void 0):a?b.appendTo(a,void 0):b.appendTo(h.body,void 0)}},_onSetElAttrs:function(a){this.get("el").attr(a)},_onSetElCls:function(a){this.get("el").addClass(a)},_onSetElStyle:function(a){this.get("el").css(a)},_onSetWidth:function(a){this.get("el").width(a)},
_onSetHeight:function(a){this.get("el").height(a)},_onSetContent:function(a){var e=this.get("contentEl");if(!this.get("srcNode")||this.get("rendered"))"string"==typeof a?e.html(a):a&&e.empty().append(a);9>b.ie&&!this.get("allowTextSelection")&&e.unselectable(void 0)},_onSetVisible:function(a){var b=this.get("el"),i=this.getCssClassWithState("shown"),c=this.getCssClassWithState("hidden");a?(b.removeClass(c),b.addClass(i)):(b.removeClass(i),b.addClass(c))},__destructor:function(){var a=this.get("el");
a&&a.remove()}};return f},{requires:["node"]});
KISSY.add("component/base/box",function(){function c(){}c.ATTRS={content:{view:1},width:{view:1},height:{view:1},elCls:{view:1},elStyle:{view:1},elAttrs:{view:1},elBefore:{view:1},el:{view:1,setter:function(c){c.isNodeList||(c=$(c));return c}},render:{view:1},visible:{value:!0,view:1},srcNode:{view:1}};c.prototype={_onSetVisible:function(c){this.get("rendered")&&this.fire(c?"show":"hide")},show:function(){this.render();this.set("visible",!0);return this},hide:function(){this.set("visible",!1);return this}};
return c});KISSY.add("component/base/container",function(c,f,d,b){return f.extend([d,b])},{requires:["./controller","./delegate-children","./decorate-children"]});
KISSY.add("component/base/controller",function(c,f,d,b,h,a,e,i){function r(a){return function(b){this==b.target&&(b=b.newVal,this.get("view").set(a,b))}}function u(a){return function(b){var c=this.get("view");return b===i?c.get(a):b}}function q(k){var b,e,d,h={},g,f=k.get("xrender");b=k.getAttrs();for(d in b)if(e=b[d],e.view){if((g=k.get(d))!==i)h[d]=g;k.on("after"+c.ucfirst(d)+"Change",r(d));e.getter=u(d)}k=k.constructor;for(e=[];k&&k!=t;)(b=a.getXClassByConstructor(k))&&e.push(b),k=k.superclass&&
k.superclass.constructor;h.ksComponentCss=e;return new f(h)}function o(a,b){var e=a.relatedTarget;return e&&(e===b[0]||b.contains(e))}function g(a,b){return function(e){if(!a.get("disabled"))a[b](e)}}var j=c.Env.host.document.documentMode||c.UA.ie,m=c.Features,p=d.Gesture,n=".-ks-component-focus"+c.now(),l=".-ks-component-mouse"+c.now(),s=m.isTouchSupported(),t=h.extend([f],{isController:!0,getCssClassWithPrefix:a.getCssClassWithPrefix,initializer:function(){var a=this.get("defaultChildCfg");a.prefixCls=
a.prefixCls||this.get("prefixCls");this.setInternal("view",q(this))},createDom:function(){var a;a=this.get("view");a.create();a=a.getKeyEventTarget();this.get("allowTextSelection")||a.unselectable()},renderUI:function(){this.get("view").render();this.renderChildren()},renderChildren:function(){var a,b=this.get("children");for(a=0;a<b.length;a++)this.renderChild(b[a],a)},_onSetFocusable:function(a){var b=this.getKeyEventTarget();if(a)b.attr("tabIndex",0).attr("hideFocus",!0).on("focus"+n,g(this,"handleFocus")).on("blur"+
n,g(this,"handleBlur")).on("keydown"+n,g(this,"handleKeydown"));else b.removeAttr("tabIndex"),b.detach(n)},_onSetHandleMouseEvents:function(a){var b=this.get("el");if(a){if(!s)b.on("mouseenter"+l,g(this,"handleMouseEnter")).on("mouseleave"+l,g(this,"handleMouseLeave")).on("contextmenu"+l,g(this,"handleContextMenu"));b.on(p.start+l,g(this,"handleMouseDown")).on(p.end+l,g(this,"handleMouseUp")).on("touchcancel"+l,g(this,"handleMouseUp")).on(p.tap+l,g(this,"performActionInternal"));if(j&&9>j)b.on("dblclick"+
l,g(this,"handleDblClick"))}else b.detach(l)},_onSetFocused:function(a){a&&this.getKeyEventTarget()[0].focus()},getContentElement:function(){return this.get("view").getContentElement()},getKeyEventTarget:function(){return this.get("view").getKeyEventTarget()},addChild:function(a,e){var c=this.get("children");e===i&&(e=c.length);a=b.create(a,this);c.splice(e,0,a);this.get("rendered")&&(a=this.renderChild(a,e));return a},renderChild:function(a,e){var c,i,a=b.create(a,this);a.get("rendered")||(this.create(),
i=this.getContentElement(),(c=i[0].children[e])?a.set("elBefore",c):a.set("render",i),this.get("children")[e]=a,a.render());return a},removeChild:function(a,b){var e=this.get("children"),d=c.indexOf(a,e);-1!=d&&e.splice(d,1);(b||b===i)&&a.destroy&&a.destroy();return a},removeChildren:function(a){var b,e=[].concat(this.get("children"));for(b=0;b<e.length;b++)this.removeChild(e[b],a);return this},getChildAt:function(a){return this.get("children")[a]||null},handleDblClick:function(a){this.performActionInternal(a)},
handleMouseOver:function(a){var b=this.get("el");o(a,b)||this.handleMouseEnter(a)},handleMouseOut:function(a){var b=this.get("el");o(a,b)||this.handleMouseLeave(a)},handleMouseEnter:function(a){this.set("highlighted",!!a)},handleMouseLeave:function(a){this.set("active",!1);this.set("highlighted",!a)},handleMouseDown:function(a){var b;if(1==a.which||s)if(b=this.getKeyEventTarget(),this.get("activeable")&&this.set("active",!0),this.get("focusable")&&(b[0].focus(),this.set("focused",!0)),!this.get("allowTextSelection"))b=
(b=a.target.nodeName)&&b.toLowerCase(),"input"!=b&&"textarea"!=b&&a.preventDefault()},handleMouseUp:function(a){this.get("active")&&(1==a.which||s)&&this.set("active",!1)},handleContextMenu:function(){},handleFocus:function(a){this.set("focused",!!a);this.fire("focus")},handleBlur:function(a){this.set("focused",!a);this.fire("blur")},handleKeyEventInternal:function(a){if(a.keyCode==d.KeyCodes.ENTER)return this.performActionInternal(a)},handleKeydown:function(a){if(this.handleKeyEventInternal(a))return a.halt(),
!0},performActionInternal:function(){},destructor:function(){var a,b=this.get("children");for(a=0;a<b.length;a++)b[a].destroy&&b[a].destroy();this.get("view").destroy()}},{ATTRS:{handleMouseEvents:{value:!0},focusable:{value:!0,view:1},allowTextSelection:{view:1,value:!1},activeable:{value:!0},focused:{view:1,value:!1},active:{view:1,value:!1},highlighted:{view:1,value:!1},children:{value:[]},prefixCls:{value:c.config("component/prefixCls")||"ks-",view:1},prefixXClass:{},xtype:{},parent:{setter:function(a){this.addTarget(a)}},
disabled:{view:1,value:!1},xrender:{value:e},defaultChildCfg:{value:{}}}},{xclass:"controller"});return t},{requires:"./box,event,./impl,./uibase,./manager,./render".split(",")});
KISSY.add("component/base/decorate-child",function(c,f){function d(){}c.augment(d,f,{decorateInternal:function(b){this.set("el",b);var c=this.get("defaultChildCfg").prefixCls;if(b=b.one("."+(c+this.get("decorateChildCls"))))(c=this.findChildConstructorFromNode(c,b))?this.decorateChildrenInternal(c,b):this.decorateChildren(b)}});return d},{requires:["./decorate-children"]});
KISSY.add("component/base/decorate-children",function(c,f){function d(){}c.augment(d,{decorateInternal:function(b){this.set("el",b);this.decorateChildren(b)},findChildConstructorFromNode:function(b,c){var a=c[0].className||"";return a?(a=a.replace(RegExp("\\b"+b,"ig"),""),f.getConstructorByXClass(a)):null},decorateChildrenInternal:function(b,d,a){a=c.merge(this.get("defaultChildCfg"),a,{srcNode:d});delete a.xclass;return this.addChild(new b(a))},decorateChildren:function(b){var c=this,a=c.get("defaultChildCfg").prefixCls,
e=c.get("defaultChildCfg").xclass;b.children().each(function(b){var d=c.findChildConstructorFromNode(a,b)||e&&f.getConstructorByXClass(e);c.decorateChildrenInternal(d,b)})}});return d},{requires:["./manager"]});
KISSY.add("component/base/delegate-children",function(c,f){function d(){}function b(a){if(!this.get("disabled")){var b=this.getOwnerControl(a.target,a);if(b&&!b.get("disabled"))switch(a.type){case e.start:b.handleMouseDown(a);break;case e.end:b.handleMouseUp(a);break;case e.tap:b.performActionInternal(a);break;case "mouseover":b.handleMouseOver(a);break;case "mouseout":b.handleMouseOut(a);break;case "contextmenu":b.handleContextMenu(a);break;case "dblclick":b.handleDblClick(a)}}}var h=c.UA,a=c.Env.host.document.documentMode||
h.ie,e=f.Gesture,i=c.Features.isTouchSupported();d.ATTRS={delegateChildren:{value:!0}};c.augment(d,{__bindUI:function(){var c;this.get("delegateChildren")&&(c=e.start+" "+e.end+" "+e.tap+" touchcancel ",i||(c+="mouseover mouseout contextmenu "+(a&&9>a?"dblclick ":"")),this.get("el").on(c,b,this))},getOwnerControl:function(a){for(var b=this.get("children"),c=b.length,e=this.get("el")[0];a&&a!==e;){for(var d=0;d<c;d++)if(b[d].get("el")[0]===a)return b[d];a=a.parentNode}return null}});return d},{requires:["event"]});
KISSY.add("component/base/impl",function(c,f,d){return{Manager:d,UIBase:f,create:function(b,f){var a;if(b){!b.isController&&f&&(c.mix(b,f.get("defaultChildCfg"),!1),!b.xclass&&b.prefixXClass&&(b.xclass=b.prefixXClass,b.xtype&&(b.xclass+="-"+b.xtype)));if(!b.isController&&(a=b.xclass))a=d.getConstructorByXClass(a),b=new a(b);b.isController&&f&&b.setInternal("parent",f)}return b}}},{requires:["./uibase","./manager"]});
KISSY.add("component/base/manager",function(c){function f(a){for(var a=c.trim(a).split(/\s+/),b=0;b<a.length;b++)a[b]&&(a[b]=this.get("prefixCls")+a[b]);return a.join(" ")}var d={},b={},h={__instances:b,addComponent:function(a,c){b[a]=c},removeComponent:function(a){delete b[a]},getComponent:function(a){return b[a]},getCssClassWithPrefix:f,getXClassByConstructor:function(a){for(var b in d)if(d[b].constructor==a)return b;return 0},getConstructorByXClass:function(a){for(var a=a.split(/\s+/),b=-1,c,f=
null,h=0;h<a.length;h++){var q=d[a[h]];if(q&&(c=q.priority)>b)b=c,f=q.constructor}return f},setConstructorByXClass:function(a,b){c.isFunction(b)?d[a]={constructor:b,priority:0}:(b.priority=b.priority||0,d[a]=b)}};h.getCssClassWithPrefix=f;return h});
KISSY.add("component/base/render",function(c,f,d,b,h){return b.extend([f],{getCssClassWithState:function(a){var b=this.get("ksComponentCss");if(!b)return"";(a=a||"")&&(a="-"+a);return this.getCssClassWithPrefix(b.join(a+" ")+a)},getCssClassWithPrefix:h.getCssClassWithPrefix,getKeyEventTarget:function(){return this.get("el")},_onSetHighlighted:function(a){var b=this.getCssClassWithState("hover");this.get("el")[a?"addClass":"removeClass"](b)},_onSetDisabled:function(a){var b=this.getCssClassWithState("disabled");
this.get("el")[a?"addClass":"removeClass"](b).attr("aria-disabled",a);this.get("focusable")&&this.getKeyEventTarget().attr("tabIndex",a?-1:0)},_onSetActive:function(a){var b=this.getCssClassWithState("active");this.get("el")[a?"addClass":"removeClass"](b).attr("aria-pressed",!!a)},_onSetFocused:function(a){var b=this.get("el"),c=this.getCssClassWithState("focused");b[a?"addClass":"removeClass"](c)},getContentElement:function(){return this.get("contentEl")||this.get("el")}},{ATTRS:{prefixCls:{},focusable:{},
focused:{},active:{},disabled:{},highlighted:{}},HTML_PARSER:{disabled:function(){var a=this.getCssClassWithState("disabled");return this.get("el").hasClass(a)}}})},{requires:["./box-render","./impl","./uibase","./manager"]});
KISSY.add("component/base/uibase",function(c,f,d,b,h){var d=c.noop,a=f.extend({constructor:function(){var b;a.superclass.constructor.apply(this,arguments);this.decorateInternal&&(b=this.get("srcNode"))&&this.decorateInternal(b);this.get("autoRender")&&this.render()},bindInternal:d,syncInternal:d,initializer:function(){var a,d=c.one(this.get("srcNode"));(a=this.get("id"))&&b.addComponent(a,this);if(d){var e=this.constructor,f,o;o=this.collectConstructorChains();for(a=o.length-1;0<=a;a--)if(e=o[a],
f=e.HTML_PARSER){var e=d,g=void 0,j=void 0,j=void 0,m=this.userConfig||{};for(g in f)g in m||(j=f[g],c.isFunction(j)?(j=j.call(this,e),j!==h&&this.setInternal(g,j)):"string"==typeof j?this.setInternal(g,e.one(j)):c.isArray(j)&&j[0]&&this.setInternal(g,e.all(j[0])))}this.setInternal("srcNode",d)}},create:function(){this.get("created")||(this.fire("beforeCreateDom"),this.callMethodByHierarchy("createDom","__createDom"),this.setInternal("created",!0),this.fire("afterCreateDom"),this.callPluginsMethod("createDom"));
return this},render:function(){this.get("rendered")||(this.create(h),this.fire("beforeRenderUI"),this.callMethodByHierarchy("renderUI","__renderUI"),this.fire("afterRenderUI"),this.callPluginsMethod("renderUI"),this.fire("beforeBindUI"),a.superclass.bindInternal.call(this),this.callMethodByHierarchy("bindUI","__bindUI"),this.fire("afterBindUI"),this.callPluginsMethod("bindUI"),a.superclass.syncInternal.call(this),this.sync(),this.setInternal("rendered",!0));return this},sync:function(){this.fire("beforeSyncUI");
this.callMethodByHierarchy("syncUI","__syncUI");this.fire("afterSyncUI");this.callPluginsMethod("syncUI")},createDom:d,renderUI:d,bindUI:d,syncUI:d,plug:function(){var b;b=this.get("plugins");a.superclass.plug.apply(this,arguments);b=b[b.length-1];this.get("rendered")?(b.pluginCreateDom&&b.pluginCreateDom(this),b.pluginRenderUI&&b.pluginRenderUI(this),b.pluginBindUI&&b.pluginBindUI(this),b.pluginSyncUI&&b.pluginSyncUI(this)):this.get("created")&&b.pluginCreateDom&&b.pluginCreateDom(this);return this},
destructor:function(){var a;(a=this.get("id"))&&b.removeComponent(a)}},{name:"UIBase",ATTRS:{rendered:{value:!1},created:{value:!1},xclass:{valueFn:function(){return b.getXClassByConstructor(this.constructor)}}}}),e=a.extend;c.mix(a,{HTML_PARSER:{},extend:function r(a,d,f){var g=c.makeArray(arguments),h={},m,p=g.length,n=g[p-1];if(m=n.xclass)g[p-2].name=m;g=e.apply(this,g);c.isArray(a)&&(c.each(a.concat(g),function(a){a&&c.each(a.HTML_PARSER,function(a,b){h[b]=a})}),g.HTML_PARSER=h);m&&b.setConstructorByXClass(m,
{constructor:g,priority:n.priority});g.extend=r;return g}});return a},{requires:["rich-base","node","./manager"]});