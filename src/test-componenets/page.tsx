'use client'

import { useState } from 'react'
import MetricCard from '../components/tambo/MetricCard' 
import GraphCard from '../components/tambo/GraphCard'
import AlertList from '../components/tambo/AlertList'
import ComparisonCard from '../components/tambo/ComparisonCard'
import BusinessSummaryTable from '../components/tambo/BusinessSummaryTable'
import InsightCard from '../components/tambo/InsightCard'
import StatusBadge from '../components/tambo/StatusBadge'

export default function ComponentTestPage() {
  const [activeTab, setActiveTab] = useState<string>('all')

  const testComponents = {
    metric: {
      name: 'MetricCard',
      component: (
        <MetricCard
          title="Monthly Revenue"
          value="$245,000"
          trend="up"
          change="+12%"
          description="Total revenue for current month"
          color="blue"
          precision={2}
        />
      ),
      json: `{"type":"tool","name":"show_component_MetricCard","args":{"title":"Monthly Revenue","value":"$245,000","trend":"up","change":"+12%"}}`
    },
    graph: {
      name: 'GraphCard',
      component: (
        <GraphCard
          title="Revenue Trend"
          type="line"
          data={[
            { label: 'Jan', value: 200 },
            { label: 'Feb', value: 220 },
            { label: 'Mar', value: 245 },
            { label: 'Apr', value: 260 },
            { label: 'May', value: 275 },
            { label: 'Jun', value: 290 }
          ]}
          yAxisLabel="Revenue ($K)"
          xAxisLabel="Month"
          showGrid={true}
          showLegend={true}
          colorScheme="blue"
          height={400}
        />
      ),
      json: `{"type":"tool","name":"show_component_GraphCard","args":{"title":"Revenue Trend","type":"line","data":[{"label":"Jan","value":200},{"label":"Feb","value":220},{"label":"Mar","value":245}]}}`
    },
    alert: {
      name: 'AlertList',
      component: (
        <AlertList
          title="Business Alerts"
          alerts={[
            {
              title: 'Margin Compression',
              description: 'Gross margin decreased from 48% to 45%',
              level: 'warning',
              timestamp: '2 hours ago',
              status: 'new',
              action: 'Review pricing strategy'
            },
            {
              title: 'CAC Increase',
              description: 'Customer acquisition cost rose by 15%',
              level: 'critical',
              timestamp: '5 hours ago',
              status: 'new',
              action: 'Optimize marketing channels'
            }
          ]}
          autoRefresh={false}
          refreshInterval={60000}
          maxAlerts={10}
        />
      ),
      json: `{"type":"tool","name":"show_component_AlertList","args":{"title":"Business Alerts","alerts":[{"title":"Margin Decline","description":"Gross margin down 3%","level":"warning"}]}}`
    },
    comparison: {
      name: 'ComparisonCard',
      component: (
        <ComparisonCard
          title="Q1 vs Q2 Performance"
          leftLabel="Q1 2025"
          leftValue="$1.0M"
          rightLabel="Q2 2025"
          rightValue="$1.2M"
          difference="+$200K"
          percentageChange="+20%"
          verdict="better"
        />
      ),
      json: `{"type":"tool","name":"show_component_ComparisonCard","args":{"title":"Q1 vs Q2","leftLabel":"Q1","leftValue":"$1M","rightLabel":"Q2","rightValue":"$1.2M","percentageChange":"+20%","verdict":"better"}}`
    },
    table: {
      name: 'BusinessSummaryTable',
      component: (
        <BusinessSummaryTable
          title="Business Summary"
          columns={['Metric', 'Value', 'Status', 'Trend']}
          rows={[
            { item: 'Revenue', value: '$245K', status: 'success', trend: 'up', change: '+12%' },
            { item: 'Profit Margin', value: '18.5%', status: 'success', trend: 'up', change: '+2.3%' },
            { item: 'Customer Churn', value: '4.2%', status: 'warning', trend: 'up', change: '+0.8%' },
            { item: 'Active Users', value: '28,540', status: 'success', trend: 'up', change: '+15%' }
          ]}
          sortable={true}
          pagination={true}
          pageSize={10}
        />
      ),
      json: `{"type":"tool","name":"show_component_BusinessSummaryTable","args":{"title":"Dashboard","rows":[{"item":"Revenue","value":"$245K","status":"success"}]}}`
    },
    insight: {
      name: 'InsightCard',
      component: (
        <InsightCard
          title="Growth Opportunity"
          insight="Customer acquisition cost decreased by 15% while conversion rate increased by 8%, indicating successful optimization of marketing channels."
          severity="positive"
          recommendations={[
            'Scale successful marketing channels by increasing budget allocation by 20%',
            'Expand product features based on customer feedback',
            'Consider geographic expansion into untapped markets'
          ]}
          confidence={92}
        />
      ),
      json: `{"type":"tool","name":"show_component_InsightCard","args":{"title":"Key Finding","insight":"Revenue grew 12%","severity":"positive"}}`
    },
    status: {
      name: 'StatusBadge',
      component: (
        <StatusBadge
          label="System Health"
          status="success"
          value="99.9%"
          description="All systems operational. No issues detected."
        />
      ),
      json: `{"type":"tool","name":"show_component_StatusBadge","args":{"label":"System Health","status":"success"}}`
    }
  }

  const filteredComponents = activeTab === 'all' 
    ? Object.entries(testComponents)
    : Object.entries(testComponents).filter(([key]) => key === activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Component Test Suite
          </h1>
          <p className="text-gray-600">
            Test all 7 business intelligence components and their JSON formats
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            All Components
          </button>
          {Object.entries(testComponents).map(([key, { name }]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Components Grid */}
        <div className="space-y-8">
          {filteredComponents.map(([key, { name, component, json }]) => (
            <div key={key} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Component Header */}
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{name}</h2>
              </div>

              {/* Component Preview */}
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">PREVIEW</h3>
                <div className="max-w-2xl">
                  {component}
                </div>
              </div>

              {/* JSON Format */}
              <div className="p-6 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-700">
                    TAMBO AI OUTPUT FORMAT
                  </h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(json)
                      alert('JSON copied to clipboard!')
                    }}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Copy JSON
                  </button>
                </div>
                <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                  <pre>{json}</pre>
                </div>
              </div>

              {/* Test Queries */}
              <div className="p-6 bg-blue-50 border-t border-blue-100">
                <h3 className="text-sm font-semibold text-blue-900 mb-3">
                  EXAMPLE USER QUERIES
                </h3>
                <div className="space-y-2">
                  {getExampleQueries(key).map((query, idx) => (
                    <div key={idx} className="flex items-center text-sm text-blue-800">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      "{query}"
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🧪 How to Test
          </h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                1
              </div>
              <div>
                <strong className="text-gray-900">Copy JSON format</strong>
                <p className="text-sm mt-1">Click "Copy JSON" button for any component above</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                2
              </div>
              <div>
                <strong className="text-gray-900">Test in chat</strong>
                <p className="text-sm mt-1">Go to the main dashboard and try the example queries</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold mr-3">
                3
              </div>
              <div>
                <strong className="text-gray-900">Verify rendering</strong>
                <p className="text-sm mt-1">Component should appear in the workspace exactly like the preview above</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getExampleQueries(componentType: string): string[] {
  const queries: Record<string, string[]> = {
    metric: [
      'Show me monthly revenue',
      'What are our active users?',
      'Display profit margin metric'
    ],
    graph: [
      'Create a revenue trend chart',
      'Show growth over time',
      'Display quarterly performance graph'
    ],
    alert: [
      'Show me business alerts',
      'What warnings do we have?',
      'Display critical issues'
    ],
    comparison: [
      'Compare this quarter vs last quarter',
      'Show before and after performance',
      'Compare Q1 to Q2'
    ],
    table: [
      'Create a business dashboard',
      'Show summary of all metrics',
      'Display performance table'
    ],
    insight: [
      'Give me key insights',
      'What recommendations do you have?',
      'Analyze our performance'
    ],
    status: [
      'Show system status',
      'What is our health status?',
      'Display operational status'
    ]
  }

  return queries[componentType] || []
}