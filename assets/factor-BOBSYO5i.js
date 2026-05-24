(function(){function e(e,t=100){return e>t?Math.floor(e/t):t}function t(e){let t=-1;return function(n,r,i){if(i!==0&&n%i===0){let i=Math.floor(n/r*100);t!==i&&(t=i,e(i))}}}(function(){let n=t(e=>{postMessage({type:`progress`,data:e})});function r(t,n=100){return e(t,n)}function i(e){return e===0||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}function a(e,t,n,a){let o=[],s=e.length>2?Math.floor(e.length/2):e.length,c=n===1?r(s):0;for(let r=0;r<s;r++)o.push(`
                    <tr>
                        <td>÷</td>
                        <td>${i(e[r])}</td>
                        <td>=</td>
                        <td>${i(t/e[r])}</td>
                    </tr>
                `),n===1&&a(r,s,c);return`<tbody>${o.join(``)}</tbody>`}self.onmessage=function(e){try{let[t,r,i,o]=e.data,s=null;s=i===0?t.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`):`<div class="scrollable"><table>${a(t,r,o,n)}</table></div>`,postMessage({type:`data`,data:s})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();