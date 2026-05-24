(function(){function e(e,t=100n){return e>t?e/t:t}function t(e){let t=-1n;return function(n,r,i){if(i!==0n&&n%i===0n){let i=n*100n/r;t!==i&&(t=i,e(Number(i)))}}}(function(){let n=t(e=>{postMessage({type:`progress`,data:e})});function r(t,n=100n){return e(t,n)}function i(e){return e===0n||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}function a(e,t,n,a){let o=[],s=BigInt(Math.floor(e.length>2?e.length/2:e.length)),c=n===1?r(s):0n;for(let r=0n;r<s;r++)o.push(`
                    <tr>
                        <td>÷</td>
                        <td>${i(e[Number(r)])}</td>
                        <td>=</td>
                        <td>${i(t/BigInt(e[Number(r)]))}</td>
                    </tr>
                `),n===1&&a(r,s,c);return`<tbody>${o.join(``)}</tbody>`}self.onmessage=function(e){try{let[t,r,i,o]=e.data,s=null;s=i===0?t.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`):`<div class="scrollable"><table>${a(t,r,o,n)}</table></div>`,postMessage({type:`data`,data:s})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();