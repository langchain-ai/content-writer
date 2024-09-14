from typing import Any, Dict, List

from langchain_openai import ChatOpenAI
from langgraph.graph import END, START, MessagesState, StateGraph
from pydantic import BaseModel, Field


class UserRules(BaseModel):
    rules: List[str] = Field(
        description="The rules which you have inferred from the conversation."
    )


class GraphState(MessagesState):
    userRules: UserRules
    userAcceptedText: bool


DEFAULT_RULES_STRING = "*no rules have been set yet*"

SYSTEM_PROMPT = """You are a helpful assistant tasked with thoughtfully fulfilling the requests of the user.
User defined rules:
{userRules}"""


def call_model(state: GraphState) -> Dict[str, List[Dict[str, str]]]:
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    rules = DEFAULT_RULES_STRING
    if state.get("userRules") and state.get("userRules").rules:
        rules = "- " + "\n - ".join(state.get("userRules").rules)

    system_prompt = SYSTEM_PROMPT.format(userRules=rules)

    response = model.invoke(
        [{"role": "system", "content": system_prompt}, *state["messages"]]
    )

    return {"messages": [{"role": "assistant", "content": response.content}]}


def generate_insights(state: GraphState) -> Dict[str, Any]:
    system_prompt = """You are a helpful assistant, tasked with generating rules based on insights you've gathered from the following conversation.
This conversation contains back and fourth between an AI assistant, and a user who is using the assistant to generate text for things such as writing tweets.
User messages which are prefixed with "REVISION" contain the entire revised text the user made to the assistant message directly before in the conversation.
There also may be additional back and fourth between the user and the assistant which you should consider when generating rules.

In your response, include every single rule, including those which already existed. You should only ever exclude rule(s) if the user has explicitly stated something which contradicts a previous rule.
The user and assistant may have had conversations before which you do not have access to, so be careful when removing rules.

The user has defined the following rules:
{userRules}"""

    rules = DEFAULT_RULES_STRING
    if state.get("userRules") and state.get("userRules").rules:
        rules = "- " + "\n - ".join(state.get("userRules").rules)

    system_prompt = system_prompt.format(userRules=rules)

    model = ChatOpenAI(model="gpt-4o", temperature=0).with_structured_output(UserRules)

    result = model.invoke(
        [{"role": "system", "content": system_prompt}, *state["messages"]]
    )

    return {"userRules": result.rules, "userAcceptedText": False}


def should_generate_insights(state: GraphState) -> str:
    print(state)
    if state.get("userAcceptedText", False):
        return "generateInsights"
    return "callModel"


def build_graph():
    workflow = StateGraph(GraphState)

    workflow.add_node("callModel", call_model)
    workflow.add_node("generateInsights", generate_insights)
    workflow.add_conditional_edges(START, should_generate_insights)
    workflow.add_edge("callModel", END)
    workflow.add_edge("generateInsights", END)

    return workflow.compile()
