import React from 'react'
import { Link } from 'react-router-dom'

export default function Contact(){
  const accent = '#F5A623'
  const bg = '#0a0a0a'
  const text = '#ffffff'
  const textMuted = '#a0a0a0'

  return (
    <div style={{minHeight:'100vh',background:bg,color:text,fontFamily:'Inter,system-ui',display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 20px'}}>
      <div style={{maxWidth:840,margin:'0 auto',textAlign:'center'}}>
        <h1 style={{marginTop:0,marginBottom:18,fontSize:32,color:accent}}>Contact Us</h1>

        <div style={{color:textMuted,lineHeight:1.6,textAlign:'left',background:'#0f0f0f',padding:24,borderRadius:12,border:`1px solid rgba(255,255,255,0.03)`}}>
          <p>Dear Reader,</p>
          <p>We believe that feedback loop is very important for a platform to succeed. We highly value your opinions and comments. You can contact us if you have anything to say, for example:</p>
          <ol>
            <li>If you found any broken download link, scanning issue, or incorrect file, please report it here (<Link to="/report" style={{color:accent}}>report</Link> or <a href="mailto:NovaLibrary@gmail.com" style={{color:accent}}>NovaLibrary@gmail.com</a>).</li>
            <li>Please don't send new book requests by email — we don't fulfill requests by email. Instead, use the Request a Book section for that purpose (<Link to="/request-a-book" style={{color:accent}}>Request a Book</Link>).</li>
          </ol>
          <p>If you want to say something else privately, apart from book requests or error reporting, feel free to contact us at the address below.</p>

          <p style={{marginTop:18}}><a href="mailto:NovaLibrary@gmail.com" style={{color:accent,fontWeight:700}}>NovaLibrary@gmail.com</a></p>
        </div>
      </div>
    </div>
  )
}
