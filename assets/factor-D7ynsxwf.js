(function(){(function(){let e=0;function t(t,n,r){if(t%r===0){let r=Math.floor(t/n*100);e!==r&&(e=r,postMessage({type:`progress`,data:r}))}}function n(e,t=100){return e>t?Math.floor(e/t):t}function r(e){return e===0||e?e.toLocaleString(`en-US`):`<span class="font-danger">Error!</span>`}self.onmessage=function(e){try{let[i,a,o,s]=e.data,c=null;if(o===0)c=i.join(`, `).replace(/, ((?:.(?!, ))+)$/,` and $1`);else{let e=[],o=i.length>2?Math.floor(i.length/2):i.length;if(s===1){let s=n(o);for(let n=0;n<o;n++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${r(i[n])}</td>
                        <td>=</td>
                        <td>${r(a/i[n])}</td>
                    </tr>
                `),t(n,o,s)}else for(let t=0;t<o;t++)e.push(`
                    <tr>
                        <td>&#247;</td>
                        <td>${r(i[t])}</td>
                        <td>=</td>
                        <td>${r(a/i[t])}</td>
                    </tr>
                `);c=`<div class="scrollable"><table>${e.join(``)}</table></div>`}postMessage({type:`data`,data:c})}catch(e){postMessage(e)}}})()})();