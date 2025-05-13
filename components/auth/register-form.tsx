import React from "react"

export function RegisterForm() {
  return (
    <form>
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
        <input id="email" type="email" className="w-full border rounded px-2 py-1" disabled placeholder="Email input (placeholder)" />
      </div>
      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
        <input id="password" type="password" className="w-full border rounded px-2 py-1" disabled placeholder="Password input (placeholder)" />
      </div>
      <button type="submit" className="w-full bg-primary text-white py-2 rounded" disabled>
        Register (form not implemented)
      </button>
    </form>
  )
}
