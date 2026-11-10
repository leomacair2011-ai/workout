/* Apex Access self-contained static catalogue adapter. No orders or payments. */
(() => {
  'use strict';
  const upstream = window.fetch.bind(window);
  const file = (path) => new URL(path.replace(/^\//,''), document.baseURI).href;
  let cataloguePromise;
  const catalogue = () => cataloguePromise ||= upstream(file('catalog/0.json'), {cache:'force-cache'}).then(r=>{if(!r.ok)throw new Error('Product catalogue could not load');return r.json()}).catch(e=>{cataloguePromise=null;throw e});
  // Prefetch once, immediately, for search/category pages.
  window.APEX_CATALOGUE_PROMISE = catalogue();
  window.APEX_CATALOGUE_PROMISE.catch(()=>{});
  const slug = text => String(text||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const cards = p => ({id:p.id,name:p.name,brand:p.brand,category:p.category,price:p.price,currency:p.currency,stock:p.stock,images:p.images,featured:p.featured,tag:p.tag,availability:p.availability,variantCount:p.variants?.length||0,summary:true});
  const searchScore = (p,q) => {
    if(!q)return 1;
    const words=q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const name=p.name.toLowerCase();const text=(p.name+' '+p.category+' '+(p.tags||[]).join(' ')+' '+(p.searchTags||[]).join(' ')+' '+(p.variants||[]).map(v=>v.label).join(' ')).toLowerCase();
    if(!words.every(w=>text.includes(w)))return 0;
    if(name===q)return 1000;
    if(name.startsWith(q))return 500;
    return 1;
  };
  function response(data,status=200){return Response.json(data,{status,headers:{'Cache-Control':'no-store'}})}
  window.fetch=async function(resource,options){
    const url=typeof resource==='string'?resource:resource instanceof URL?resource.href:resource?.url||'';
    const method=(options?.method||resource?.method||'GET').toUpperCase();
    if(/^\/(?:translations\.json|fx-fallback\.json)/.test(url))return upstream(file(url),options);
    if(url.startsWith('/api/rates'))return upstream(file('fx-fallback.json'),options);
    if(url.startsWith('/api/products')||url.startsWith('/products.json')){
      try{
        const params=new URL(url,location.origin).searchParams;
        let arr=await catalogue();
        if(params.has('ids')){const ids=params.get('ids').split(',').slice(0,200);arr=ids.map(id=>arr.find(p=>p.id===id)).filter(Boolean)}
        else {
          if(params.has('category')&&params.get('category')!=='all')arr=arr.filter(p=>slug(p.category)===params.get('category'));
          if(params.has('brand')&&params.get('brand')!=='all')arr=arr.filter(p=>p.brand===params.get('brand'));
          if(params.has('size')&&params.get('size')!=='all')arr=arr.filter(p=>p.sizes?.includes(params.get('size')));
          if(params.get('instock')==='1')arr=arr.filter(p=>p.stock==null||p.stock>0);
          const q=(params.get('q')||'').trim().toLowerCase();
          if(q)arr=arr.map(p=>({p,score:searchScore(p,q)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).map(x=>x.p);
          const sort=params.get('sort');
          if(sort==='price-asc')arr=[...arr].sort((a,b)=>(a.price??Infinity)-(b.price??Infinity));
          if(sort==='price-desc')arr=[...arr].sort((a,b)=>(b.price??-Infinity)-(a.price??-Infinity));
          if(sort==='name')arr=[...arr].sort((a,b)=>a.name.localeCompare(b.name));
        }
        const total=arr.length;
        const offset=Math.max(0,Number.parseInt(params.get('offset')||'0',10)||0);
        const limit=Math.min(200,Math.max(1,Number.parseInt(params.get('limit')||'24',10)||24));
        const sliced=arr.slice(offset,offset+limit);
        return response({currency:'USD',products:params.get('view')==='cards'?sliced.map(cards):sliced,total});
      }catch(e){console.warn('Apex catalogue unavailable:',e);return response({error:'Catalogue temporarily unavailable'},503)}
    }
    if(url.startsWith('/api/checkout'))return response({error:'Checkout is not enabled yet.'},503);
    if(/^\/api\/(?:subscribe|contact|payment-status)/.test(url))return response({error:'This action is not available on the static preview. Please use the published support contact links.'},503);
    return upstream(resource,options);
  };
})();
