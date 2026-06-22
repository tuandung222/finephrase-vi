"use strict";(self.webpackChunkfinephrase_vi=self.webpackChunkfinephrase_vi||[]).push([["2635"],{6678(e,t,a){a.d(t,{diagram:()=>z});var r=a(8213),i=a(5871),n=a(7959),l=a(8424),s=a(797),o=a(8731),c={showLegend:!0,ticks:5,max:null,min:0,graticule:"circle"},d={axes:[],curves:[],options:c},g=structuredClone(d),h=l.UI.radar,u=(0,s.K2)(()=>(0,n.$t)({...h,...(0,l.zj)().radar}),"getConfig"),p=(0,s.K2)(()=>g.axes,"getAxes"),x=(0,s.K2)(()=>g.curves,"getCurves"),m=(0,s.K2)(()=>g.options,"getOptions"),$=(0,s.K2)(e=>{g.axes=e.map(e=>({name:e.name,label:e.label??e.name}))},"setAxes"),f=(0,s.K2)(e=>{g.curves=e.map(e=>({name:e.name,label:e.label??e.name,entries:y(e.entries)}))},"setCurves"),y=(0,s.K2)(e=>{if(void 0==e[0].axis)return e.map(e=>e.value);let t=p();if(0===t.length)throw Error("Axes must be populated before curves for reference entries");return t.map(t=>{let a=e.find(e=>e.axis?.$refText===t.name);if(void 0===a)throw Error("Missing entry for axis "+t.label);return a.value})},"computeCurveEntries"),v={getAxes:p,getCurves:x,getOptions:m,setAxes:$,setCurves:f,setOptions:(0,s.K2)(e=>{let t=e.reduce((e,t)=>(e[t.name]=t,e),{});g.options={showLegend:t.showLegend?.value??c.showLegend,ticks:t.ticks?.value??c.ticks,max:t.max?.value??c.max,min:t.min?.value??c.min,graticule:t.graticule?.value??c.graticule}},"setOptions"),getConfig:u,clear:(0,s.K2)(()=>{(0,l.IU)(),g=structuredClone(d)},"clear"),setAccTitle:l.SV,getAccTitle:l.iN,setDiagramTitle:l.ke,getDiagramTitle:l.ab,getAccDescription:l.m7,setAccDescription:l.EI},w=(0,s.K2)(e=>{(0,i.S)(e,v);let{axes:t,curves:a,options:r}=e;v.setAxes(t),v.setCurves(a),v.setOptions(r)},"populate"),M={parse:(0,s.K2)(async e=>{let t=await (0,o.qg)("radar",e);s.Rm.debug(t),w(t)},"parse")},b=(0,s.K2)((e,t,a,i)=>{let n=i.db,l=n.getAxes(),s=n.getCurves(),o=n.getOptions(),c=n.getConfig(),d=n.getDiagramTitle(),g=C((0,r.D)(t),c),h=o.max??Math.max(...s.map(e=>Math.max(...e.entries))),u=o.min,p=Math.min(c.width,c.height)/2;K(g,l,p,o.ticks,o.graticule),L(g,l,p,c),k(g,l,s,u,h,o.graticule,c),S(g,s,o.showLegend,c),g.append("text").attr("class","radarTitle").text(d).attr("x",0).attr("y",-c.height/2-c.marginTop)},"draw"),C=(0,s.K2)((e,t)=>{let a=t.width+t.marginLeft+t.marginRight,r=t.height+t.marginTop+t.marginBottom,i={x:t.marginLeft+t.width/2,y:t.marginTop+t.height/2};return(0,l.a$)(e,r,a,t.useMaxWidth??!0),e.attr("viewBox",`0 0 ${a} ${r}`),e.append("g").attr("transform",`translate(${i.x}, ${i.y})`)},"drawFrame"),K=(0,s.K2)((e,t,a,r,i)=>{if("circle"===i)for(let t=0;t<r;t++){let i=a*(t+1)/r;e.append("circle").attr("r",i).attr("class","radarGraticule")}else if("polygon"===i){let i=t.length;for(let n=0;n<r;n++){let l=a*(n+1)/r,s=t.map((e,t)=>{let a=2*t*Math.PI/i-Math.PI/2,r=l*Math.cos(a),n=l*Math.sin(a);return`${r},${n}`}).join(" ");e.append("polygon").attr("points",s).attr("class","radarGraticule")}}},"drawGraticule"),L=(0,s.K2)((e,t,a,r)=>{let i=t.length;for(let n=0;n<i;n++){let l=t[n].label,s=2*n*Math.PI/i-Math.PI/2;e.append("line").attr("x1",0).attr("y1",0).attr("x2",a*r.axisScaleFactor*Math.cos(s)).attr("y2",a*r.axisScaleFactor*Math.sin(s)).attr("class","radarAxisLine"),e.append("text").text(l).attr("x",a*r.axisLabelFactor*Math.cos(s)).attr("y",a*r.axisLabelFactor*Math.sin(s)).attr("class","radarAxisLabel")}},"drawAxes");function k(e,t,a,r,i,n,l){let s=t.length,o=Math.min(l.width,l.height)/2;a.forEach((t,a)=>{if(t.entries.length!==s)return;let c=t.entries.map((e,t)=>{let a=2*Math.PI*t/s-Math.PI/2,n=T(e,r,i,o);return{x:n*Math.cos(a),y:n*Math.sin(a)}});"circle"===n?e.append("path").attr("d",A(c,l.curveTension)).attr("class",`radarCurve-${a}`):"polygon"===n&&e.append("polygon").attr("points",c.map(e=>`${e.x},${e.y}`).join(" ")).attr("class",`radarCurve-${a}`)})}function T(e,t,a,r){return r*(Math.min(Math.max(e,t),a)-t)/(a-t)}function A(e,t){let a=e.length,r=`M${e[0].x},${e[0].y}`;for(let i=0;i<a;i++){let n=e[(i-1+a)%a],l=e[i],s=e[(i+1)%a],o=e[(i+2)%a],c={x:l.x+(s.x-n.x)*t,y:l.y+(s.y-n.y)*t},d={x:s.x-(o.x-l.x)*t,y:s.y-(o.y-l.y)*t};r+=` C${c.x},${c.y} ${d.x},${d.y} ${s.x},${s.y}`}return`${r} Z`}function S(e,t,a,r){if(!a)return;let i=(r.width/2+r.marginRight)*3/4,n=-(3*(r.height/2+r.marginTop))/4;t.forEach((t,a)=>{let r=e.append("g").attr("transform",`translate(${i}, ${n+20*a})`);r.append("rect").attr("width",12).attr("height",12).attr("class",`radarLegendBox-${a}`),r.append("text").attr("x",16).attr("y",0).attr("class","radarLegendText").text(t.label)})}(0,s.K2)(k,"drawCurves"),(0,s.K2)(T,"relativeRadius"),(0,s.K2)(A,"closedRoundCurve"),(0,s.K2)(S,"drawLegend");var I=(0,s.K2)((e,t)=>{let a="";for(let r=0;r<e.THEME_COLOR_LIMIT;r++){let i=e[`cScale${r}`];a+=`
		.radarCurve-${r} {
			color: ${i};
			fill: ${i};
			fill-opacity: ${t.curveOpacity};
			stroke: ${i};
			stroke-width: ${t.curveStrokeWidth};
		}
		.radarLegendBox-${r} {
			fill: ${i};
			fill-opacity: ${t.curveOpacity};
			stroke: ${i};
		}
		`}return a},"genIndexStyles"),O=(0,s.K2)(e=>{let t=(0,l.P$)(),a=(0,l.zj)(),r=(0,n.$t)(t,a.themeVariables),i=(0,n.$t)(r.radar,e);return{themeVariables:r,radarOptions:i}},"buildRadarStyleOptions"),z={parser:M,db:v,renderer:{draw:b},styles:(0,s.K2)(({radar:e}={})=>{let{themeVariables:t,radarOptions:a}=O(e);return`
	.radarTitle {
		font-size: ${t.fontSize};
		color: ${t.titleColor};
		dominant-baseline: hanging;
		text-anchor: middle;
	}
	.radarAxisLine {
		stroke: ${a.axisColor};
		stroke-width: ${a.axisStrokeWidth};
	}
	.radarAxisLabel {
		dominant-baseline: middle;
		text-anchor: middle;
		font-size: ${a.axisLabelFontSize}px;
		color: ${a.axisColor};
	}
	.radarGraticule {
		fill: ${a.graticuleColor};
		fill-opacity: ${a.graticuleOpacity};
		stroke: ${a.graticuleColor};
		stroke-width: ${a.graticuleStrokeWidth};
	}
	.radarLegendText {
		text-anchor: start;
		font-size: ${a.legendFontSize}px;
		dominant-baseline: hanging;
	}
	${I(t,a)}
	`},"styles")}}}]);