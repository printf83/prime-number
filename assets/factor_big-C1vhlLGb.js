(function(){(function(){let e=0n;function t(t,n,r){if(t%r===0n){let r=t*100n/n;e!==r&&(e=r,postMessage({type:`progress`,data:Number(r)}))}}function n(e,t=100n){return e>t?e/t:t}function r(e){return e===0n||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}self.onmessage=function(e){try{let[i,a,o,s]=e.data,c=null;if(o===0)c=i.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`);else{let e=[],o=BigInt(Math.floor(i.length>2?i.length/2:i.length));if(s===1){let s=n(o);for(let n=0n;n<o;n++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${r(i[Number(n)])}</td>
                        <td>=</td>
                        <td>${r(a/BigInt(i[Number(n)]))}</td>
                    </tr>
                `),t(n,o,s)}else for(let t=0n;t<o;t++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${r(i[Number(t)])}</td>
                        <td>=</td>
                        <td>${r(a/BigInt(i[Number(t)]))}</td>
                    </tr>
                `);c=`<div class="scrollable"><table>${e.join(``)}</table></div>`}postMessage({type:`data`,data:c})}catch(e){postMessage(e)}}})()})();