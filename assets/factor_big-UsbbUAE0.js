(function(){function e(e,t=100n){return e>t?e/t:t}function t(e){let t=-1n;return function(n,r,i){if(i!==0n&&n%i===0n){let i=n*100n/r;t!==i&&(t=i,e(Number(i)))}}}(function(){let n=t(e=>{postMessage({type:`progress`,data:e})});function r(t,n=100n){return e(t,n)}function i(e){return e===0n||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}self.onmessage=function(e){try{let[t,a,o,s]=e.data,c=null;if(o===0)c=t.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`);else{let e=[],o=BigInt(Math.floor(t.length>2?t.length/2:t.length));if(s===1){let s=r(o);for(let r=0n;r<o;r++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${i(t[Number(r)])}</td>
                        <td>=</td>
                        <td>${i(a/BigInt(t[Number(r)]))}</td>
                    </tr>
                `),n(r,o,s)}else for(let n=0n;n<o;n++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${i(t[Number(n)])}</td>
                        <td>=</td>
                        <td>${i(a/BigInt(t[Number(n)]))}</td>
                    </tr>
                `);c=`<div class="scrollable"><table>${e.join(``)}</table></div>`}postMessage({type:`data`,data:c})}catch(e){postMessage({type:`error`,error:String(e&&typeof e==`object`&&`message`in e?e.message:e)})}}})()})();