(function(){function e(e,t=100){let n=t<=0?1:t;return e>n?Math.max(1,Math.floor(e/n)):1}function t(e){let t=-1;return function(n,r,i){if(i!==0){if(n===r){t!==100&&(t=100,e(100));return}if(n%i===0){let i=Math.floor(n/r*100);t!==i&&(t=i,e(i))}}}}function n(e){return e===0||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}(function(){let r=t(e=>{postMessage({type:`progress`,data:e})});function i(t,r,i,a){let o=[],s=t.length>2?Math.floor(t.length/2):t.length,c=i===1?e(s):0;for(let e=0;e<s;e++)o.push(`
                    <tr>
                        <td>÷</td>
                        <td>${n(t[e])}</td>
                        <td>=</td>
                        <td>${n(r/t[e])}</td>
                    </tr>
                `),i===1&&a(e,s,c);return`<tbody>${o.join(``)}</tbody>`}self.onmessage=function(e){try{let[t,n,a,o]=e.data,s=null;s=a===0?t.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`):`<div class="scrollable"><table>${i(t,n,o,r)}</table></div>`,postMessage({type:`data`,data:s})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();