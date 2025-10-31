import React from 'react'

export default function SettingsTest() {
  console.log('SettingsTest component rendering')
  
  return (
    <div className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Settings Test Page
        </h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-slate-600">
            If you can see this, the basic routing is working.
          </p>
          <div className="mt-4">
            <button 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              onClick={() => console.log('Button clicked')}
            >
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
