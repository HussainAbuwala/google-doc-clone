import React from 'react'
import "./Template.css"
import BlankT from './BlankT'
import LetterT from './LetterT'
import ResumeT from './ResumeT'
import ProposalT from './ProposalT'

export default function Template({socket}) {
  return (
    <div className='template-container'>
        <h5>Start a new document</h5>
        <div className='template-container-docs'>
        <BlankT socket={socket} />
        <LetterT socket={socket}/>
        <ResumeT socket={socket}/>
        <ProposalT socket={socket} />
        </div>
    </div>
  )
}
