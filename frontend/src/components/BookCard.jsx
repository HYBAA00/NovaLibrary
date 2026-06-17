import React from 'react'
import { BookOpen, Star } from 'lucide-react'
import { assetUrl } from '../utils/format'

export default function BookCard({ book, onOpen }) {
  const cover = assetUrl(book?.cover_url)

  return (
    <article className="book-card" onClick={() => onOpen?.(book?.id)} role={onOpen ? 'button' : undefined} tabIndex={onOpen ? 0 : undefined}>
      <div className="book-cover">
        {cover ? <img src={cover} alt={book?.title || 'Book cover'} /> : <BookOpen size={42} />}
      </div>
      <div className="book-card-body">
        <div className="book-title" title={book?.title}>{book?.title || 'Sans titre'}</div>
        <div className="book-author">{book?.author_name || 'Auteur inconnu'}</div>
        <div className="book-card-footer">
          <span className="tag">{book?.category_name || 'General'}</span>
          <span className="rating"><Star size={14} fill="currentColor" /> {Number(book?.average_rating || 0).toFixed(1)}</span>
        </div>
      </div>
    </article>
  )
}
