import ReactMarkdown, { Components } from 'react-markdown'
import 'katex/dist/katex.min.css'
import RemarkMath from 'remark-math'
import RemarkBreaks from 'remark-breaks'
import RehypeKatex from 'rehype-katex'
import gfm from 'remark-gfm'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { atelierSeasideLight } from 'react-syntax-highlighter/dist/esm/styles/hljs'

import './markdown.css'
import { useContext } from 'react'
import MarkdownContext from '@/MarkdownContext'

// Available language https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_LANGUAGES_HLJS.MD
const capitalizationLanguageNameMap: Record<string, string> = {
  sql: 'SQL',
  javascript: 'JavaScript',
  java: 'Java',
  typescript: 'TypeScript',
  vbscript: 'VBScript',
  css: 'CSS',
  html: 'HTML',
  xml: 'XML',
  php: 'PHP',
  python: 'Python',
  yaml: 'Yaml',
  mermaid: 'Mermaid',
  markdown: 'MarkDown',
  makefile: 'MakeFile',
}

const getCorrectCapitalizationLanguageName = (language: string) => {
  if (!language)
    return 'Plain'

  if (language in capitalizationLanguageNameMap)
    return capitalizationLanguageNameMap[language]

  return language.charAt(0).toUpperCase() + language.substring(1)
}

const Markdown = ({ ...props }) => {

  const { onLinkClick } = useContext(MarkdownContext)

  const components: Components = {
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '')
      const language = match?.[1]
      const languageShowName = getCorrectCapitalizationLanguageName(language || '')
      return (!inline && match)
        ? (
          <div>
            <div className='markdown-code-header'>
              <div className='text-[13px] text-gray-500 font-normal'>{languageShowName}</div>
            </div>
            <SyntaxHighlighter
              {...props}
              style={{ ...atelierSeasideLight }}
              customStyle={{
                paddingLeft: 12,
                backgroundColor: '#fff',
                borderRadius: 4
              }}
              language={match[1]}
              showLineNumbers
              PreTag="div"
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        )
        : (
          <code {...props} className={className}>
            {children}
          </code>
        )
    },
    img({ src, alt, ...props }) {
      return (
        <img
          src={src}
          alt={alt}
          width={250}
          height={250}
          className="max-w-full h-auto align-middle border-none rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mt-2 mb-2"
          {...props}
        />
      )
    },
    p: (paragraph) => {
      const { node }: any = paragraph
      if (node.children[0].tagName === 'img') {
        const image = node.children[0]

        return (
          <>
            <img
              src={image.properties.src}
              width={250}
              height={250}
              className="max-w-full h-auto align-middle border-none rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out mt-2 mb-2"
              alt={image.properties.alt}
            />
            <p>{paragraph.children.slice(1)}</p>
          </>
        )
      }
      return <p>{paragraph.children}</p>
    },
    a: ({ node, ...props }) => {
      const { href, title, children } = props
      return (
        <a
          style={{ outline: 'none' }}
          href={href}
          title={title}
          children={children}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            href && onLinkClick?.(e, href)
          }} />
      )
    }
  }

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[[RemarkMath, { singleDollarTextMath: false }], gfm, RemarkBreaks]}
        rehypePlugins={[
          RehypeKatex,
        ]}
        components={components}
        linkTarget='_blank'>
        {props.content}
      </ReactMarkdown>
    </div>
  )
}

export default Markdown