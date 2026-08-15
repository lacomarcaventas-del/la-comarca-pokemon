"use client";
import {useEffect} from "react";

export default function FacebookFeed(){
 useEffect(()=>{
  const existing=document.getElementById("facebook-jssdk");
  if(!existing){const s=document.createElement("script");s.id="facebook-jssdk";s.async=true;s.defer=true;s.crossOrigin="anonymous";s.src="https://connect.facebook.net/es_LA/sdk.js#xfbml=1&version=v25.0";document.body.appendChild(s)}
  else if((window as any).FB) (window as any).FB.XFBML.parse();
 },[]);
 return <section className="panel" style={{marginTop:24}}>
  <div className="categoryHeader">
   <div><h2>📢 La Comarca en Facebook</h2><p className="muted">Publicaciones recientes de nuestra página oficial.</p></div>
   <a className="btn2" href="https://www.facebook.com/ComarcaTCG" target="_blank" rel="noreferrer">Ver Facebook</a>
  </div>
  <div style={{display:"flex",justifyContent:"center",width:"100%",marginTop:16}}>
   <div style={{width:"100%",maxWidth:900,minHeight:900,display:"flex",justifyContent:"center",overflow:"hidden"}}>
    <div className="fb-page" data-href="https://www.facebook.com/ComarcaTCG" data-tabs="timeline" data-width="900" data-height="1000" data-small-header="false" data-adapt-container-width="true" data-hide-cover="false" data-show-facepile="true" style={{width:"100%"}}>
     <blockquote cite="https://www.facebook.com/ComarcaTCG" className="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/ComarcaTCG">La Comarca</a></blockquote>
    </div>
   </div>
  </div>
 </section>;
}
