from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ============================================
# SURVEY DATA MODELS
# ============================================

class SurveyQuestion(BaseModel):
    question_text: str
    current_score: int  # Percentage
    pechanga_overall: int
    score_2024: int
    global_norm: Optional[int] = None
    industry_norm: Optional[int] = None
    positive_percentage: int
    neutral_negative_percentage: Optional[int] = None
    status: str  # "strength", "moderate", "critical"

class CategoryData(BaseModel):
    category_name: str
    category_id: str
    average_score: int
    status: str
    questions: List[SurveyQuestion]
    coaching_tips: List[str]
    action_items: List[str]

class OverviewMetrics(BaseModel):
    total_responses: int
    overall_engagement_score: int
    strengths_count: int
    critical_areas_count: int
    top_3_strengths: List[Dict[str, any]]
    top_3_concerns: List[Dict[str, any]]

class CoachingGuide(BaseModel):
    category: str
    focus_area: str
    current_state: str
    target_state: str
    coaching_strategies: List[str]
    conversation_starters: List[str]
    measurement_tips: List[str]


# ============================================
# SURVEY DATA - Food Court FY2025
# ============================================

SURVEY_DATA = {
    "pride_in_company": {
        "category_name": "Pride in Company",
        "category_id": "pride_in_company",
        "average_score": 91,
        "status": "strength",
        "questions": [
            {
                "question_text": "I would recommend Pechanga Resort Casino as a good place to work to my friends and family.",
                "current_score": 95,
                "pechanga_overall": 90,
                "score_2024": 96,
                "global_norm": 75,
                "industry_norm": 79,
                "positive_percentage": 95,
                "status": "strength"
            },
            {
                "question_text": "Overall, I am satisfied with my job.",
                "current_score": 86,
                "pechanga_overall": 87,
                "score_2024": 90,
                "global_norm": 78,
                "positive_percentage": 86,
                "status": "strength"
            },
            {
                "question_text": "I am proud to work at Pechanga Resort Casino.",
                "current_score": 88,
                "pechanga_overall": 89,
                "score_2024": 94,
                "global_norm": 81,
                "industry_norm": 83,
                "positive_percentage": 88,
                "status": "strength"
            },
            {
                "question_text": "I intend to stay with Pechanga Resort Casino for at least the next 12 months.",
                "current_score": 95,
                "pechanga_overall": 88,
                "score_2024": 92,
                "global_norm": 83,
                "positive_percentage": 95,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "Celebrate and reinforce what's working - team pride is exceptionally high (91% avg)",
            "Use team members as brand ambassadors in recruiting efforts",
            "Share success stories in team meetings to maintain momentum",
            "Recognize individuals who embody company values publicly",
            "Continue current recognition practices that drive pride"
        ],
        "action_items": [
            "Monthly: Share 2-3 success stories from team members",
            "Weekly: Publicly recognize someone living company values",
            "Quarterly: Facilitate team member testimonial sessions",
            "Ongoing: Ask for referrals since recommendation score is 95%"
        ]
    },
    "teamwork_collaboration": {
        "category_name": "Teamwork & Collaboration",
        "category_id": "teamwork_collaboration",
        "average_score": 68,
        "status": "critical",
        "questions": [
            {
                "question_text": "There is effective cooperation across departments.",
                "current_score": 65,
                "pechanga_overall": 68,
                "score_2024": 83,
                "global_norm": 63,
                "positive_percentage": 65,
                "neutral_negative_percentage": 23,
                "status": "critical"
            },
            {
                "question_text": "There is a feeling of mutual trust in my department.",
                "current_score": 70,
                "pechanga_overall": 69,
                "score_2024": 83,
                "global_norm": 75,
                "positive_percentage": 70,
                "neutral_negative_percentage": 23,
                "status": "critical"
            }
        ],
        "coaching_tips": [
            "🚨 CRITICAL PRIORITY: Only 65% positive on cross-department cooperation",
            "Address trust gaps immediately - 23% neutral/negative is significant",
            "Focus on breaking down silos between teams",
            "Create structured opportunities for cross-functional collaboration",
            "Model collaborative behavior as a leader",
            "Good news: Improved from 68% to 83% in 2024 - maintain momentum"
        ],
        "action_items": [
            "IMMEDIATE: Hold cross-department problem-solving sessions",
            "Weekly: Facilitate joint team huddles with other departments",
            "Monthly: Create cross-functional project teams",
            "Daily: Model asking for help and collaboration publicly",
            "Bi-weekly: Address trust issues in 1-on-1 conversations",
            "Implement 'collaboration wins' recognition program"
        ]
    },
    "performance_management": {
        "category_name": "Performance Management",
        "category_id": "performance_management",
        "average_score": 88,
        "status": "strength",
        "questions": [
            {
                "question_text": "My immediate supervisor gives regular feedback on my work performance.",
                "current_score": 81,
                "pechanga_overall": 75,
                "score_2024": 90,
                "global_norm": 76,
                "positive_percentage": 81,
                "status": "strength"
            },
            {
                "question_text": "My immediate supervisor values my knowledge and contributions.",
                "current_score": 84,
                "pechanga_overall": 76,
                "score_2024": 87,
                "global_norm": 79,
                "positive_percentage": 84,
                "status": "strength"
            },
            {
                "question_text": "I understand my job performance requirements.",
                "current_score": 100,
                "pechanga_overall": 95,
                "score_2024": 100,
                "global_norm": 77,
                "positive_percentage": 100,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "🌟 EXCEPTIONAL: 100% understand job requirements - maintain clarity",
            "Continue regular feedback - 81% is good but can reach 90%",
            "Ensure feedback is specific, timely, and balanced",
            "Make team members feel valued through active listening",
            "Document and celebrate improvements"
        ],
        "action_items": [
            "Daily: Provide specific, in-the-moment feedback",
            "Weekly: Conduct brief performance check-ins (5-10 min)",
            "Monthly: Formal performance conversations with documentation",
            "Ongoing: Ask for team member input before giving feedback",
            "Practice: Use SBI model (Situation-Behavior-Impact)"
        ]
    },
    "growth_development": {
        "category_name": "Growth & Development",
        "category_id": "growth_development",
        "average_score": 77,
        "status": "moderate",
        "questions": [
            {
                "question_text": "Pechanga Resort Casino provides me the opportunity to improve my knowledge and job skills.",
                "current_score": 86,
                "pechanga_overall": 83,
                "score_2024": 94,
                "global_norm": 77,
                "positive_percentage": 86,
                "status": "strength"
            },
            {
                "question_text": "There are career opportunities for me at Pechanga Resort Casino.",
                "current_score": 84,
                "pechanga_overall": 82,
                "score_2024": 98,
                "global_norm": 67,
                "positive_percentage": 84,
                "status": "strength"
            },
            {
                "question_text": "Job promotions are fair.",
                "current_score": 70,
                "pechanga_overall": 64,
                "score_2024": 88,
                "global_norm": 54,
                "positive_percentage": 70,
                "neutral_negative_percentage": 19,
                "status": "critical"
            },
            {
                "question_text": "My Divisional Vice President is available and accessible if needed.",
                "current_score": 74,
                "pechanga_overall": 74,
                "score_2024": 73,
                "global_norm": 68,
                "positive_percentage": 74,
                "neutral_negative_percentage": 21,
                "status": "moderate"
            }
        ],
        "coaching_tips": [
            "⚠️ CRITICAL: Promotion fairness perception at only 70% (19% negative)",
            "Create transparent promotion criteria and processes",
            "Communicate promotion decisions clearly and consistently",
            "Ensure equal access to development opportunities",
            "Address perception issues through open dialogue",
            "Good: Skills development and career opportunities are strong (84-86%)"
        ],
        "action_items": [
            "URGENT: Document and share promotion criteria publicly",
            "Monthly: Discuss career paths in team meetings",
            "Quarterly: Review promotion process for fairness and transparency",
            "Weekly: Highlight team members who got promoted and why",
            "Bi-weekly: Career development 1-on-1s with each team member",
            "Create mentorship program to support career advancement"
        ]
    },
    "manager_relationship": {
        "category_name": "Manager Relationship",
        "category_id": "manager_relationship",
        "average_score": 84,
        "status": "strength",
        "questions": [
            {
                "question_text": "My immediate supervisor cares about Team Members in my department.",
                "current_score": 84,
                "pechanga_overall": 79,
                "score_2024": 92,
                "global_norm": 83,
                "industry_norm": 80,
                "positive_percentage": 84,
                "status": "strength"
            },
            {
                "question_text": "I am comfortable discussing concerns with my immediate supervisor.",
                "current_score": 84,
                "pechanga_overall": 76,
                "score_2024": 96,
                "global_norm": 80,
                "positive_percentage": 84,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "Strong foundation: 84% feel cared for and comfortable",
            "Continue building psychological safety",
            "Practice active listening without judgment",
            "Follow up on concerns raised to show you care",
            "Make yourself approachable and available"
        ],
        "action_items": [
            "Daily: Check in with at least 3 team members informally",
            "Weekly: Hold 'open door' time for drop-in conversations",
            "Monthly: Ask: 'What concerns do you have that we haven't discussed?'",
            "Ongoing: Thank team members for bringing up concerns",
            "Practice: Respond to concerns within 24-48 hours"
        ]
    },
    "empowerment": {
        "category_name": "Team Member Empowerment",
        "category_id": "empowerment",
        "average_score": 80,
        "status": "strength",
        "questions": [
            {
                "question_text": "My job allows me to do the things that I do best.",
                "current_score": 79,
                "pechanga_overall": 78,
                "score_2024": 86,
                "positive_percentage": 79,
                "status": "moderate"
            },
            {
                "question_text": "I am appropriately involved in decisions that affect my work.",
                "current_score": 70,
                "pechanga_overall": 71,
                "score_2024": 88,
                "global_norm": 69,
                "industry_norm": 67,
                "positive_percentage": 70,
                "neutral_negative_percentage": 21,
                "status": "moderate"
            },
            {
                "question_text": "I am able to balance my work and personal life.",
                "current_score": 79,
                "pechanga_overall": 82,
                "score_2024": 85,
                "global_norm": 75,
                "industry_norm": 78,
                "positive_percentage": 79,
                "neutral_negative_percentage": 16,
                "status": "moderate"
            },
            {
                "question_text": "I have meaningful discussions with my immediate supervisor about my career development.",
                "current_score": 77,
                "pechanga_overall": 66,
                "score_2024": 81,
                "global_norm": 66,
                "positive_percentage": 77,
                "status": "moderate"
            },
            {
                "question_text": "I feel that my work has an impact on Pechanga Resort Casino's success.",
                "current_score": 91,
                "pechanga_overall": 85,
                "score_2024": 85,
                "global_norm": 87,
                "positive_percentage": 91,
                "status": "strength"
            },
            {
                "question_text": "My immediate supervisor encourages us to participate in company events.",
                "current_score": 81,
                "pechanga_overall": 79,
                "score_2024": 88,
                "positive_percentage": 81,
                "neutral_negative_percentage": 16,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "⚠️ FOCUS AREA: Only 70% feel involved in decisions (21% negative)",
            "Improve career development conversations (77% is moderate)",
            "Leverage high impact feeling (91%) to drive engagement",
            "Increase team member involvement in decision-making",
            "Balance autonomy with guidance"
        ],
        "action_items": [
            "Weekly: Ask for team input on operational decisions",
            "Monthly: Dedicated career development conversations (30 min)",
            "Daily: Explain 'why' behind decisions to increase buy-in",
            "Quarterly: Let team members lead projects or initiatives",
            "Ongoing: Create decision-making frameworks for team autonomy"
        ]
    },
    "resources_support": {
        "category_name": "Resources & Support",
        "category_id": "resources_support",
        "average_score": 75,
        "status": "moderate",
        "questions": [
            {
                "question_text": "I have the tools and equipment I need to do my job well.",
                "current_score": 79,
                "pechanga_overall": 81,
                "score_2024": 92,
                "global_norm": 80,
                "industry_norm": 82,
                "positive_percentage": 79,
                "neutral_negative_percentage": 16,
                "status": "moderate"
            },
            {
                "question_text": "Enough people are available in my department to accomplish the necessary workload.",
                "current_score": 65,
                "pechanga_overall": 71,
                "score_2024": 75,
                "global_norm": 48,
                "positive_percentage": 65,
                "neutral_negative_percentage": 26,
                "status": "critical"
            },
            {
                "question_text": "Pechanga Resort Casino makes an effort to create a fun environment for our Team Members.",
                "current_score": 83,
                "pechanga_overall": 83,
                "score_2024": 85,
                "global_norm": 80,
                "positive_percentage": 83,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "🚨 CRITICAL: Staffing levels - only 65% positive (26% negative)",
            "Highest concern: not enough people for workload",
            "Address burnout risk from understaffing immediately",
            "Optimize workflows while advocating for adequate staffing",
            "Tools/equipment is moderate (79%) - identify gaps"
        ],
        "action_items": [
            "IMMEDIATE: Conduct workload analysis with team",
            "Weekly: Ask: 'What's overwhelming you?' in huddles",
            "Monthly: Present staffing needs to leadership with data",
            "Daily: Redistribute work to balance load",
            "Ongoing: Eliminate low-value tasks to free up capacity",
            "Audit tools/equipment needs and submit requests"
        ]
    },
    "recognition_reward": {
        "category_name": "Recognition & Reward",
        "category_id": "recognition_reward",
        "average_score": 85,
        "status": "strength",
        "questions": [
            {
                "question_text": "I am satisfied with the benefits provided by Pechanga Resort Casino.",
                "current_score": 91,
                "pechanga_overall": 87,
                "score_2024": 96,
                "global_norm": 72,
                "industry_norm": 78,
                "positive_percentage": 91,
                "status": "strength"
            },
            {
                "question_text": "Overall, I am satisfied with my compensation at Pechanga Resort Casino.",
                "current_score": 77,
                "pechanga_overall": 72,
                "score_2024": 79,
                "positive_percentage": 77,
                "status": "moderate"
            },
            {
                "question_text": "I am satisfied with the various events Pechanga Resort Casino provides to show its appreciation of Team Members.",
                "current_score": 86,
                "pechanga_overall": 84,
                "score_2024": 92,
                "positive_percentage": 86,
                "status": "strength"
            },
            {
                "question_text": "My immediate supervisor lets me know when I have done a good job.",
                "current_score": 84,
                "pechanga_overall": 74,
                "score_2024": 88,
                "global_norm": 81,
                "positive_percentage": 84,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "Strong area: Benefits (91%) and appreciation events (86%)",
            "Continue frequent recognition - 84% is good, push to 90%+",
            "Compensation satisfaction moderate (77%) - acknowledge limits",
            "Focus on non-monetary recognition strategies",
            "Make recognition specific and timely"
        ],
        "action_items": [
            "Daily: Recognize at least 2 team members for good work",
            "Weekly: Public recognition in team meetings",
            "Monthly: Written thank you notes or emails",
            "Ongoing: Use specific praise (not just 'good job')",
            "Practice: Recognize effort, not just results"
        ]
    },
    "trust": {
        "category_name": "Trust",
        "category_id": "trust",
        "average_score": 77,
        "status": "moderate",
        "questions": [
            {
                "question_text": "I trust my immediate supervisor.",
                "current_score": 76,
                "pechanga_overall": 79,
                "score_2024": 90,
                "global_norm": 84,
                "positive_percentage": 76,
                "neutral_negative_percentage": 15,
                "status": "moderate"
            },
            {
                "question_text": "My immediate supervisor's behavior is consistent with the company values.",
                "current_score": 77,
                "pechanga_overall": 78,
                "score_2024": 92,
                "global_norm": 84,
                "industry_norm": 77,
                "positive_percentage": 77,
                "neutral_negative_percentage": 16,
                "status": "moderate"
            },
            {
                "question_text": "I am treated with respect at work.",
                "current_score": 81,
                "pechanga_overall": 81,
                "score_2024": 88,
                "global_norm": 85,
                "positive_percentage": 81,
                "status": "strength"
            }
        ],
        "coaching_tips": [
            "⚠️ CONCERN: Trust in supervisor at 76% (below 84% global norm)",
            "Trust is foundational - address this proactively",
            "Model consistency between words and actions",
            "Keep commitments and communicate when you can't",
            "Be transparent about decisions and reasoning",
            "Good: Respect is strong (81%)"
        ],
        "action_items": [
            "Daily: Follow through on commitments made",
            "Weekly: Admit mistakes openly and take ownership",
            "Monthly: Ask for feedback on your leadership",
            "Ongoing: Be consistent in how you treat all team members",
            "Practice: Share decision-making rationale transparently",
            "Build trust through small, repeated positive interactions"
        ]
    }
}


# ============================================
# API ENDPOINTS
# ============================================

@api_router.get("/")
async def root():
    return {"message": "Leadership Coaching Dashboard API - Food Court FY2025"}

@api_router.get("/survey/overview", response_model=OverviewMetrics)
async def get_survey_overview():
    """Get overall survey metrics and summary"""
    
    # Calculate top strengths
    strengths = []
    concerns = []
    
    for category_id, data in SURVEY_DATA.items():
        category_info = {
            "category": data["category_name"],
            "score": data["average_score"],
            "status": data["status"]
        }
        
        if data["status"] == "strength":
            strengths.append(category_info)
        elif data["status"] == "critical":
            concerns.append(category_info)
    
    # Sort by score
    strengths.sort(key=lambda x: x["score"], reverse=True)
    concerns.sort(key=lambda x: x["score"])
    
    # Calculate overall engagement
    total_score = sum(cat["average_score"] for cat in SURVEY_DATA.values())
    avg_score = total_score // len(SURVEY_DATA)
    
    return {
        "total_responses": 43,
        "overall_engagement_score": avg_score,
        "strengths_count": len(strengths),
        "critical_areas_count": len(concerns),
        "top_3_strengths": strengths[:3],
        "top_3_concerns": concerns[:3] if concerns else []
    }

@api_router.get("/survey/categories", response_model=List[CategoryData])
async def get_all_categories():
    """Get all survey categories with questions and coaching guidance"""
    categories = []
    
    for category_id, data in SURVEY_DATA.items():
        categories.append(CategoryData(**data))
    
    return categories

@api_router.get("/survey/category/{category_id}", response_model=CategoryData)
async def get_category_detail(category_id: str):
    """Get detailed information for a specific category"""
    if category_id not in SURVEY_DATA:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return CategoryData(**SURVEY_DATA[category_id])

@api_router.get("/survey/strengths")
async def get_strengths():
    """Get all strength areas"""
    strengths = []
    
    for category_id, data in SURVEY_DATA.items():
        if data["status"] == "strength":
            strengths.append({
                "category_id": category_id,
                "category_name": data["category_name"],
                "average_score": data["average_score"],
                "coaching_tips": data["coaching_tips"]
            })
    
    strengths.sort(key=lambda x: x["average_score"], reverse=True)
    return {"strengths": strengths}

@api_router.get("/survey/weaknesses")
async def get_weaknesses():
    """Get all areas needing improvement"""
    weaknesses = []
    
    for category_id, data in SURVEY_DATA.items():
        if data["status"] in ["critical", "moderate"]:
            # Extract critical questions
            critical_questions = [q for q in data["questions"] if q["status"] == "critical"]
            
            weaknesses.append({
                "category_id": category_id,
                "category_name": data["category_name"],
                "average_score": data["average_score"],
                "status": data["status"],
                "critical_questions": critical_questions,
                "coaching_tips": data["coaching_tips"],
                "action_items": data["action_items"]
            })
    
    # Sort by score (lowest first)
    weaknesses.sort(key=lambda x: x["average_score"])
    return {"areas_for_improvement": weaknesses}

@api_router.get("/survey/action-plans")
async def get_action_plans():
    """Get comprehensive action plans for leaders"""
    
    action_plans = {
        "immediate_actions": [
            {
                "priority": "HIGH",
                "area": "Cross-Department Cooperation",
                "current_score": 65,
                "actions": [
                    "Schedule weekly cross-functional team huddles",
                    "Create joint problem-solving sessions with other departments",
                    "Assign cross-departmental projects to build relationships",
                    "Recognize and reward collaborative behaviors publicly"
                ]
            },
            {
                "priority": "HIGH",
                "area": "Staffing Levels",
                "current_score": 65,
                "actions": [
                    "Conduct immediate workload analysis with team",
                    "Identify and eliminate non-essential tasks",
                    "Build business case for additional staffing",
                    "Implement better workflow optimization",
                    "Monitor team for burnout signs daily"
                ]
            },
            {
                "priority": "HIGH",
                "area": "Promotion Fairness",
                "current_score": 70,
                "actions": [
                    "Document and publicly share promotion criteria",
                    "Ensure transparent communication about opportunities",
                    "Create clear development paths for each role",
                    "Explain promotion decisions when they occur"
                ]
            }
        ],
        "ongoing_priorities": [
            {
                "area": "Trust Building",
                "current_score": 76,
                "weekly_actions": [
                    "Follow through on all commitments",
                    "Admit mistakes openly",
                    "Be consistent in treatment of all team members",
                    "Share reasoning behind decisions"
                ]
            },
            {
                "area": "Career Development Discussions",
                "current_score": 77,
                "weekly_actions": [
                    "Schedule monthly 30-min career conversations",
                    "Ask about long-term goals and aspirations",
                    "Create individual development plans",
                    "Connect team members with mentors"
                ]
            },
            {
                "area": "Decision Involvement",
                "current_score": 70,
                "weekly_actions": [
                    "Ask for team input before finalizing decisions",
                    "Explain the 'why' behind all decisions",
                    "Let team members lead initiatives",
                    "Create frameworks for autonomous decision-making"
                ]
            }
        ],
        "maintain_strengths": [
            {
                "area": "Pride in Company",
                "current_score": 91,
                "actions": [
                    "Continue sharing success stories",
                    "Recognize value-driven behaviors",
                    "Leverage team as brand ambassadors",
                    "Maintain current recognition practices"
                ]
            },
            {
                "area": "Performance Clarity",
                "current_score": 100,
                "actions": [
                    "Keep expectations crystal clear",
                    "Provide regular, specific feedback",
                    "Document performance conversations",
                    "Celebrate improvements publicly"
                ]
            }
        ],
        "coaching_framework": {
            "daily_habits": [
                "Recognize 2-3 team members for good work",
                "Check in informally with at least 3 people",
                "Provide one piece of specific feedback",
                "Model collaborative behavior",
                "Follow through on commitments made"
            ],
            "weekly_habits": [
                "Hold team huddle with celebration + priorities",
                "Conduct 3-5 brief performance check-ins (5-10 min)",
                "Public recognition in team meetings",
                "Ask for input on upcoming decisions",
                "Cross-department coordination meeting"
            ],
            "monthly_habits": [
                "30-min career development conversations with each team member",
                "Review promotion fairness and transparency",
                "Present staffing needs to leadership",
                "Formal performance documentation",
                "Team feedback session on leadership effectiveness"
            ]
        }
    }
    
    return action_plans

@api_router.get("/survey/coaching-guides")
async def get_coaching_guides():
    """Get detailed coaching conversation guides"""
    
    guides = [
        {
            "category": "Teamwork & Collaboration",
            "focus_area": "Cross-Department Cooperation",
            "current_state": "Only 65% positive, 23% neutral/negative",
            "target_state": "Reach 85%+ through structured collaboration",
            "coaching_strategies": [
                "Create 'collaboration champions' from each department",
                "Hold weekly joint huddles to break down silos",
                "Implement cross-functional project teams",
                "Recognize and reward collaborative behaviors",
                "Address conflicts between departments immediately"
            ],
            "conversation_starters": [
                "What challenges do you face working with [other department]?",
                "How can we improve communication between teams?",
                "What would make cross-department work easier for you?",
                "Who in other departments should we connect with more often?"
            ],
            "measurement_tips": [
                "Track number of cross-department interactions weekly",
                "Monitor resolution time for cross-functional issues",
                "Survey team monthly on collaboration quality",
                "Count 'collaboration wins' and celebrate them"
            ]
        },
        {
            "category": "Resources & Support",
            "focus_area": "Adequate Staffing",
            "current_state": "Only 65% positive, 26% say not enough people",
            "target_state": "Reach 80%+ through optimization + advocacy",
            "coaching_strategies": [
                "Conduct detailed workload analysis with team",
                "Eliminate non-essential tasks and processes",
                "Build data-driven case for additional staffing",
                "Implement better workflow distribution",
                "Monitor team for burnout signs daily"
            ],
            "conversation_starters": [
                "What's overwhelming you right now?",
                "Which tasks take time but add little value?",
                "If you had one more person, what would change?",
                "What can we stop doing to free up capacity?"
            ],
            "measurement_tips": [
                "Track overtime hours and patterns",
                "Monitor task completion rates",
                "Assess stress levels in 1-on-1s",
                "Calculate work-per-person ratios"
            ]
        },
        {
            "category": "Growth & Development",
            "focus_area": "Promotion Fairness",
            "current_state": "70% positive, 19% feel promotions are unfair",
            "target_state": "85%+ through transparency and consistency",
            "coaching_strategies": [
                "Document clear promotion criteria for all roles",
                "Share criteria publicly and discuss in team meetings",
                "Explain promotion decisions when they occur",
                "Ensure equal access to development opportunities",
                "Create individual development plans with timelines"
            ],
            "conversation_starters": [
                "What does it take to get promoted in your view?",
                "Do you feel you have equal opportunities to advance?",
                "What would make the promotion process more fair?",
                "What skills do you need to develop for the next level?"
            ],
            "measurement_tips": [
                "Track promotion rates across demographics",
                "Monitor internal vs external promotion ratios",
                "Survey perception of fairness quarterly",
                "Document all promotion decisions and rationale"
            ]
        },
        {
            "category": "Trust",
            "focus_area": "Building Supervisor Trust",
            "current_state": "76% trust supervisor (below 84% global norm)",
            "target_state": "90%+ through consistency and transparency",
            "coaching_strategies": [
                "Model consistency between words and actions",
                "Keep commitments or communicate early if you can't",
                "Be transparent about decision-making process",
                "Admit mistakes openly and take ownership",
                "Treat all team members consistently and fairly"
            ],
            "conversation_starters": [
                "What can I do to earn your trust more fully?",
                "Have I ever said one thing and done another?",
                "What would increase your confidence in my leadership?",
                "How can I be more transparent with the team?"
            ],
            "measurement_tips": [
                "Ask for feedback on your leadership monthly",
                "Track commitment follow-through rate",
                "Monitor team member openness in meetings",
                "Survey trust levels quarterly"
            ]
        },
        {
            "category": "Team Member Empowerment",
            "focus_area": "Decision Involvement",
            "current_state": "70% feel appropriately involved, 21% negative",
            "target_state": "85%+ through inclusive decision-making",
            "coaching_strategies": [
                "Ask for team input before finalizing decisions",
                "Explain reasoning behind decisions clearly",
                "Let team members lead projects and initiatives",
                "Create decision-making frameworks for autonomy",
                "Share decision-making power where appropriate"
            ],
            "conversation_starters": [
                "What decisions should you be more involved in?",
                "How can I better include your perspective?",
                "What would you change if you had more say?",
                "Which decisions frustrate you when made without input?"
            ],
            "measurement_tips": [
                "Count decisions made with vs without team input",
                "Track team member-led initiatives",
                "Monitor engagement in decision discussions",
                "Survey involvement satisfaction monthly"
            ]
        }
    ]
    
    return {"coaching_guides": guides}


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
