import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Target,
  Users,
  Award,
  MessageSquare,
  ArrowRight,
  ChevronRight,
  BookOpen,
  Lightbulb,
  ClipboardCheck
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Utility function to get status color
const getStatusColor = (status) => {
  switch(status) {
    case 'strength': return 'bg-green-100 text-green-800 border-green-300';
    case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'critical': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusBadge = (status) => {
  switch(status) {
    case 'strength': return <Badge className="bg-green-500">Strength</Badge>;
    case 'moderate': return <Badge className="bg-yellow-500">Moderate</Badge>;
    case 'critical': return <Badge className="bg-red-500">Critical</Badge>;
    default: return <Badge>Unknown</Badge>;
  }
};

const getScoreColor = (score) => {
  if (score >= 85) return 'text-green-600';
  if (score >= 70) return 'text-yellow-600';
  return 'text-red-600';
};

// Dashboard Home Page
const Dashboard = () => {
  const [overview, setOverview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, categoriesRes] = await Promise.all([
        axios.get(`${API}/survey/overview`),
        axios.get(`${API}/survey/categories`)
      ]);
      setOverview(overviewRes.data);
      setCategories(categoriesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg p-8 shadow-lg">
        <h1 className="text-4xl font-bold mb-3" data-testid="dashboard-title">Food Court Leadership Dashboard</h1>
        <p className="text-xl text-blue-100 mb-6">FY2025 Team Member Survey Results & Coaching Guidance</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Total Responses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="total-responses">{overview?.total_responses}</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Engagement Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="engagement-score">{overview?.overall_engagement_score}%</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Strengths</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                {overview?.strengths_count}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-100">Critical Areas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                <AlertTriangle className="w-8 h-8" />
                {overview?.critical_areas_count}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Top 3 Strengths
            </CardTitle>
            <CardDescription>Areas where your team excels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.top_3_strengths.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold" data-testid={`strength-${index}`}>{item.category}</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{item.score}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Concerns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Areas Needing Attention
            </CardTitle>
            <CardDescription>Priority focus areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview?.top_3_concerns.length > 0 ? (
                overview.top_3_concerns.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        !
                      </div>
                      <div>
                        <div className="font-semibold" data-testid={`concern-${index}`}>{item.category}</div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-red-600">{item.score}%</div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">No critical concerns identified!</div>
              )}
              <Alert className="bg-blue-50 border-blue-200">
                <Lightbulb className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Quick Tip</AlertTitle>
                <AlertDescription className="text-blue-700">
                  Focus 80% of coaching effort on these areas for maximum impact.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Categories Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            All Survey Categories
          </CardTitle>
          <CardDescription>Complete overview of all assessment areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link 
                key={category.category_id} 
                to={`/category/${category.category_id}`}
                className="block"
              >
                <Card className={`hover:shadow-lg transition-shadow cursor-pointer border-2 ${getStatusColor(category.status)}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg" data-testid={`category-${category.category_id}`}>{category.category_name}</CardTitle>
                      {getStatusBadge(category.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Average Score</span>
                        <span className={`text-2xl font-bold ${getScoreColor(category.average_score)}`}>
                          {category.average_score}%
                        </span>
                      </div>
                      <Progress value={category.average_score} className="h-2" />
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Category Detail Page
const CategoryDetail = () => {
  const location = useLocation();
  const categoryId = location.pathname.split('/').pop();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategory();
  }, [categoryId]);

  const loadCategory = async () => {
    try {
      const response = await axios.get(`${API}/survey/category/${categoryId}`);
      setCategory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading category:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;
  if (!category) return <div className="text-center py-12">Category not found</div>;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="category-detail-title">{category.category_name}</h1>
            <p className="text-gray-600">Detailed analysis and coaching guidance</p>
          </div>
          <div className="text-right">
            {getStatusBadge(category.status)}
            <div className={`text-4xl font-bold mt-2 ${getScoreColor(category.average_score)}`}>
              {category.average_score}%
            </div>
            <div className="text-sm text-gray-500">Average Score</div>
          </div>
        </div>
      </div>

      {/* Questions Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Survey Questions & Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {category.questions.map((question, index) => (
              <div key={index} className={`p-4 rounded-lg border-2 ${getStatusColor(question.status)}`}>
                <div className="flex justify-between items-start mb-3">
                  <p className="font-medium flex-1 pr-4" data-testid={`question-${index}`}>{question.question_text}</p>
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(question.current_score)}`}>
                      {question.current_score}%
                    </div>
                    {getStatusBadge(question.status)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4">
                  <div className="bg-white/50 p-2 rounded">
                    <div className="text-gray-600">Pechanga Overall</div>
                    <div className="font-bold">{question.pechanga_overall}%</div>
                  </div>
                  <div className="bg-white/50 p-2 rounded">
                    <div className="text-gray-600">2024 Score</div>
                    <div className="font-bold flex items-center gap-1">
                      {question.score_2024}%
                      {question.score_2024 > question.current_score ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : question.score_2024 < question.current_score ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : null}
                    </div>
                  </div>
                  {question.global_norm && (
                    <div className="bg-white/50 p-2 rounded">
                      <div className="text-gray-600">Global Norm</div>
                      <div className="font-bold">{question.global_norm}%</div>
                    </div>
                  )}
                  {question.industry_norm && (
                    <div className="bg-white/50 p-2 rounded">
                      <div className="text-gray-600">Industry Norm</div>
                      <div className="font-bold">{question.industry_norm}%</div>
                    </div>
                  )}
                </div>

                <Progress value={question.positive_percentage} className="mt-3 h-2" />
                <div className="text-xs text-gray-600 mt-1">
                  {question.positive_percentage}% Positive
                  {question.neutral_negative_percentage && (
                    <span className="text-red-600 ml-2">
                      • {question.neutral_negative_percentage}% Neutral/Negative
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Coaching Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Coaching Tips & Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {category.coaching_tips.map((tip, index) => (
              <div key={index} className="flex gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex-shrink-0">
                  <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <p className="text-gray-800" data-testid={`tip-${index}`}>{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-green-500" />
            Action Items for Leaders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {category.action_items.map((action, index) => (
              <div key={index} className="flex gap-3 p-3 hover:bg-gray-50 rounded-lg border">
                <ArrowRight className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-gray-800" data-testid={`action-${index}`}>{action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Strengths & Weaknesses Page
const Analysis = () => {
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      const [strengthsRes, weaknessesRes] = await Promise.all([
        axios.get(`${API}/survey/strengths`),
        axios.get(`${API}/survey/weaknesses`)
      ]);
      setStrengths(strengthsRes.data.strengths);
      setWeaknesses(weaknessesRes.data.areas_for_improvement);
      setLoading(false);
    } catch (error) {
      console.error('Error loading analysis:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-3xl font-bold mb-2">Strengths & Weaknesses Analysis</h1>
        <p className="text-gray-600">Focus areas for leadership development</p>
      </div>

      {/* Strengths Section */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle2 className="w-6 h-6" />
            Team Strengths - Maintain & Leverage
          </CardTitle>
          <CardDescription>Areas where your team is performing exceptionally well</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {strengths.map((strength, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xl font-bold" data-testid={`strength-area-${index}`}>{strength.category_name}</h3>
                  <div className="text-3xl font-bold text-green-600">{strength.average_score}%</div>
                </div>
                <div className="space-y-2">
                  {strength.coaching_tips.map((tip, tipIndex) => (
                    <div key={tipIndex} className="flex gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
                {index < strengths.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weaknesses Section */}
      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Target className="w-6 h-6" />
            Areas for Improvement - Priority Focus
          </CardTitle>
          <CardDescription>Critical and moderate areas needing immediate attention</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-8">
            {weaknesses.map((weakness, index) => (
              <div key={index} className={`border-l-4 ${weakness.status === 'critical' ? 'border-red-500' : 'border-yellow-500'} pl-4`}>
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <h3 className="text-xl font-bold" data-testid={`weakness-area-${index}`}>{weakness.category_name}</h3>
                    {getStatusBadge(weakness.status)}
                  </div>
                  <div className={`text-3xl font-bold ${getScoreColor(weakness.average_score)}`}>
                    {weakness.average_score}%
                  </div>
                </div>

                {weakness.critical_questions && weakness.critical_questions.length > 0 && (
                  <Alert className="mb-4 bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Critical Questions</AlertTitle>
                    <AlertDescription>
                      <div className="mt-2 space-y-2">
                        {weakness.critical_questions.map((q, qi) => (
                          <div key={qi} className="text-red-700">
                            • {q.question_text} <strong>({q.current_score}%)</strong>
                          </div>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">COACHING STRATEGIES:</h4>
                  <div className="space-y-2">
                    {weakness.coaching_tips.slice(0, 3).map((tip, tipIndex) => (
                      <div key={tipIndex} className="flex gap-2 text-sm text-gray-700 bg-yellow-50 p-2 rounded">
                        <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-sm text-gray-600 mb-2">IMMEDIATE ACTION ITEMS:</h4>
                  <div className="space-y-2">
                    {weakness.action_items.slice(0, 4).map((action, actionIndex) => (
                      <div key={actionIndex} className="flex gap-2 text-sm text-gray-700">
                        <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {index < weaknesses.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Action Plans Page
const ActionPlans = () => {
  const [actionPlans, setActionPlans] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActionPlans();
  }, []);

  const loadActionPlans = async () => {
    try {
      const response = await axios.get(`${API}/survey/action-plans`);
      setActionPlans(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading action plans:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-3xl font-bold mb-2">Leadership Action Plans</h1>
        <p className="text-gray-600">Comprehensive coaching framework and daily practices</p>
      </div>

      {/* Coaching Framework */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Daily, Weekly & Monthly Coaching Framework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">Daily Habits</TabsTrigger>
              <TabsTrigger value="weekly">Weekly Habits</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Habits</TabsTrigger>
            </TabsList>
            
            <TabsContent value="daily" className="mt-4">
              <div className="space-y-2">
                {actionPlans?.coaching_framework.daily_habits.map((habit, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border" data-testid={`daily-habit-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="weekly" className="mt-4">
              <div className="space-y-2">
                {actionPlans?.coaching_framework.weekly_habits.map((habit, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border" data-testid={`weekly-habit-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="monthly" className="mt-4">
              <div className="space-y-2">
                {actionPlans?.coaching_framework.monthly_habits.map((habit, index) => (
                  <div key={index} className="flex gap-3 p-3 bg-white rounded-lg border" data-testid={`monthly-habit-${index}`}>
                    <CheckCircle2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                    <span>{habit}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Immediate Actions */}
      <Card>
        <CardHeader className="bg-red-50">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-6 h-6" />
            Immediate High-Priority Actions
          </CardTitle>
          <CardDescription>Address these critical areas first</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {actionPlans?.immediate_actions.map((action, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <Badge className="bg-red-500 mb-2">{action.priority} PRIORITY</Badge>
                    <h3 className="text-xl font-bold" data-testid={`immediate-action-${index}`}>{action.area}</h3>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{action.current_score}%</div>
                </div>
                <div className="space-y-2 mt-3">
                  {action.actions.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex gap-2 p-2 bg-red-50 rounded">
                      <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
                {index < actionPlans.immediate_actions.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ongoing Priorities */}
      <Card>
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Target className="w-6 h-6" />
            Ongoing Development Priorities
          </CardTitle>
          <CardDescription>Maintain focus on these areas consistently</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionPlans?.ongoing_priorities.map((priority, index) => (
              <Card key={index} className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg" data-testid={`ongoing-priority-${index}`}>{priority.area}</CardTitle>
                  <CardDescription>Current: {priority.current_score}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {priority.weekly_actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex gap-2 text-sm">
                        <ChevronRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintain Strengths */}
      <Card>
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Award className="w-6 h-6" />
            Maintain Your Strengths
          </CardTitle>
          <CardDescription>Don't lose momentum in high-performing areas</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {actionPlans?.maintain_strengths.map((strength, index) => (
              <Card key={index} className="border-2 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-800" data-testid={`maintain-strength-${index}`}>{strength.area}</CardTitle>
                  <CardDescription className="text-green-600 font-bold">Current: {strength.current_score}%</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {strength.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Coaching Guides Page
const CoachingGuides = () => {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const response = await axios.get(`${API}/survey/coaching-guides`);
      setGuides(response.data.coaching_guides);
      setLoading(false);
    } catch (error) {
      console.error('Error loading guides:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h1 className="text-3xl font-bold mb-2">Coaching Conversation Guides</h1>
        <p className="text-gray-600">How to have effective coaching conversations with your team</p>
      </div>

      <div className="space-y-6">
        {guides.map((guide, index) => (
          <Card key={index} className="border-2">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className="mb-2">{guide.category}</Badge>
                  <CardTitle className="text-2xl" data-testid={`guide-${index}`}>{guide.focus_area}</CardTitle>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current & Target State */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Alert className="bg-red-50 border-red-200">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800">Current State</AlertTitle>
                    <AlertDescription className="text-red-700">
                      {guide.current_state}
                    </AlertDescription>
                  </Alert>
                  <Alert className="bg-green-50 border-green-200">
                    <Target className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Target State</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {guide.target_state}
                    </AlertDescription>
                  </Alert>
                </div>

                {/* Coaching Strategies */}
                <div className="col-span-2 md:col-span-1">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-500" />
                    Coaching Strategies
                  </h4>
                  <div className="space-y-2">
                    {guide.coaching_strategies.map((strategy, sIndex) => (
                      <div key={sIndex} className="flex gap-2 p-2 bg-blue-50 rounded text-sm">
                        <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span>{strategy}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversation Starters */}
                <div className="col-span-2 md:col-span-1">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-500" />
                    Conversation Starters
                  </h4>
                  <div className="space-y-2">
                    {guide.conversation_starters.map((starter, sIndex) => (
                      <div key={sIndex} className="flex gap-2 p-2 bg-purple-50 rounded text-sm">
                        <span className="text-purple-600 font-bold flex-shrink-0">💬</span>
                        <span className="italic">"{starter}"</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Measurement Tips */}
                <div className="col-span-2">
                  <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-500" />
                    How to Measure Progress
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {guide.measurement_tips.map((tip, tIndex) => (
                      <div key={tIndex} className="flex gap-2 p-2 bg-green-50 rounded text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-2" />
                <span className="text-xl font-bold text-gray-900">Leadership Coach</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link to="/">
                  <Button variant="ghost" data-testid="nav-dashboard">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/analysis">
                  <Button variant="ghost" data-testid="nav-analysis">
                    <Target className="w-4 h-4 mr-2" />
                    Analysis
                  </Button>
                </Link>
                <Link to="/action-plans">
                  <Button variant="ghost" data-testid="nav-action-plans">
                    <ClipboardCheck className="w-4 h-4 mr-2" />
                    Action Plans
                  </Button>
                </Link>
                <Link to="/coaching-guides">
                  <Button variant="ghost" data-testid="nav-coaching-guides">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Coaching Guides
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/category/:categoryId" element={<CategoryDetail />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/action-plans" element={<ActionPlans />} />
            <Route path="/coaching-guides" element={<CoachingGuides />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-gray-500 text-sm">
              Food Court FY2025 Team Member Survey • Leadership Coaching Dashboard
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
