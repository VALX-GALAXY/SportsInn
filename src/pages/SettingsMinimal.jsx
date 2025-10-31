import React from 'react'

export default function SettingsMinimal() {
  console.log('SettingsMinimal: Component rendering')
  
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Minimal Settings Page
        </h1>
        <div className="border border-white/20 bg-white/10 dark:bg-slate-950/10 backdrop-blur-lg p-6 rounded-lg shadow">
            <p className="text-slate-700 dark:text-slate-200 mb-4">
            This is a minimal settings page to test if the issue is with the complex Settings component.
          </p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                Test Input
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-white/20 bg-white/10 dark:bg-white/10 backdrop-blur-lg dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400"
                placeholder="Enter some text"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                Test Select
              </label>
              <select className="w-full px-3 py-2 border border-white/20 bg-white/10 dark:bg-white/10 backdrop-blur-lg dark:border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100">
                <option value="option1">Option 1</option>
                <option value="option2">Option 2</option>
                <option value="option3">Option 3</option>
              </select>
            </div>
            <div>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                Test Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
