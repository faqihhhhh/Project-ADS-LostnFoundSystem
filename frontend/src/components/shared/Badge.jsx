export default function Badge({ text, variant = 'default' }) {
  const variants = {
    LOST:     'bg-red-100 text-red-700',
    FOUND:    'bg-green-100 text-green-700',
    OPEN:     'bg-blue-100 text-blue-700',
    PENDING:  'bg-yellow-100 text-yellow-700',
    CLOSED:   'bg-gray-100 text-gray-600',
    EXPIRED:  'bg-gray-100 text-gray-400',
    APPROVED: 'bg-green-100 text-green-700',
    REJECTED: 'bg-red-100 text-red-700',
    default:  'bg-gray-100 text-gray-600',
  }

  const style = variants[text?.toUpperCase()] || variants.default

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {text}
    </span>
  )
}
