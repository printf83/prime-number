(function(){function e(e,t=100n){let n=t<=0n?1n:t;return e>n?e/n:1n}function t(t){return e(t,100n)}function n(e){let t=-1n;return function(n,r,i){if(i!==0n){if(n===r){let n=100n;t!==n&&(t=n,e(Number(n)));return}if(n%i===0n){let i=n*100n/r;t!==i&&(t=i,e(Number(i)))}}}}function r(e){return e===0||e?e.toLocaleString(`en-US`):`Error!`}(function(){let e=n(e=>{postMessage({type:`progress`,data:e})});function i(e,n,i,a){let o=[],s=BigInt(Math.floor(e.length>2?e.length/2:e.length)),c=i===1?t(s):0n;for(let t=0n;t<s;t++)o.push(`
                    <tr>
                        <td>÷</td>
                        <td>${r(e[Number(t)])}</td>
                        <td>=</td>
                        <td>${r(n/BigInt(e[Number(t)]))}</td>
                    </tr>
                `),i===1&&a(t,s,c);return`<tbody>${o.join(``)}</tbody>`}self.onmessage=function(t){try{let[n,r,a,o]=t.data,s=null;s=a===0?n.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`):i(n,r,o,e),postMessage({type:`data`,data:s})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();