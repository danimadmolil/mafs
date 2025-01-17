import * as React from "react"

const WIP: React.FC = ({ children }) => {
  return (
    <div className="bg-yellow-200 -m-6 md:m-0 p-6 rounded-lg space-y-2 text-yellow-900">
      <h2 className="text-xl text-yellow-900">
        <span aria-hidden="true">👷‍♀️</span> Work in progress
      </h2>

      {children}

      <p>
        <a
          className="text-yellow-900 font-bold"
          href="https://github.com/stevenpetryk/mafs/issues"
          target="_blank"
          rel="noreferrer"
        >
          Make suggestions on GitHub <span aria-hidden="true">↗</span>
        </a>
      </p>
    </div>
  )
}

export default WIP
