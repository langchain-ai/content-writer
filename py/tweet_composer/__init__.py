from typing import Any, Dict, List, Annotated

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langgraph.managed.shared_value import SharedValue
from langgraph.graph import END, START, MessagesState, StateGraph
from langchain_core.messages import HumanMessage
from pydantic import BaseModel, Field
from langsmith import traceable


class GraphState(MessagesState):
    info: Annotated[dict, SharedValue.on("user_id")]
    userAcceptedText: bool


DEFAULT_RULES_STRING = "*no rules have been set yet*"

SYSTEM_PROMPT = """You are a helpful assistant tasked with thoughtfully fulfilling the requests of the user.
User defined rules:
{userRules}"""


def call_model(state: GraphState) -> Dict[str, List[Dict[str, str]]]:
    model = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    if len(state['info']) == 0:
        rules = DEFAULT_RULES_STRING
    else:
        rules = state['info']['default']['rules']
    rules = DEFAULT_RULES_STRING

    system_prompt = SYSTEM_PROMPT.format(userRules=rules)

    response = model.invoke(
        [{"role": "system", "content": system_prompt}, *state["messages"]]
    )

    return {"messages": [{"role": "assistant", "content": response.content}]}


def _prep_conversation(messages: list) -> str:
    convo = []
    for m in messages:
        if isinstance(m, HumanMessage):
            convo.append(f"User: {m.content}")
        else:
            convo.append(f"Assistant: {m.content}")
    return "\n".join(convo)


@traceable
def _reflection(rules, conversation) -> str:
    system_prompt = """This conversation contains back and fourth between an AI assistant, and a user who is using the assistant to generate text.

User messages which are prefixed with "REVISION" contain the entire revised text the user made to the assistant message directly before in the conversation.

There also may be additional back and fourth between the user and the assistant.

Based on the conversation, and paying particular attention to any changes made in the "REVISION", your job is to create a list of rules to use in the future to help the AI assistant better generate text.

In your response, include every single rule you want the AI assistant to follow in the future. You should list rules based on a combination of the existing conversation as well as previous rules. You can modify previous rules if you think the new conversation has helpful information, or you can delete old rules if they don't seem relevant, or you can add new rules based on the conversation.

Your entire response will be treated as the new rules, so don't include any preamble.

The user has defined the following rules:

<userrules>
{userRules}
</userrules>

Here is the conversation:

<conversation>
{conversation}
</conversation>

Respond with updated rules to keep in mind for future conversations. Try to keep the rules you list high signal-to-noise - don't include unnecessary ones, but make sure the ones you do add are descriptive. Combine ones that seem similar and/or contradictory"""

    system_prompt = system_prompt.format(userRules=rules, conversation=conversation)

    model = ChatAnthropic(model="claude-3-5-sonnet-20240620", temperature=0)
    # model = ChatOpenAI(model="o1-mini", temperature=1, disable_streaming=True)
    result = model.invoke(
        [{"role": "user", "content": system_prompt}]
    )
    return result.content

def generate_insights(state: GraphState) -> Dict[str, Any]:
    if len(state['info']) == 0:
        rules = DEFAULT_RULES_STRING
    else:
        rules = state['info']['default']['rules']

    rules = DEFAULT_RULES_STRING

    convo = _prep_conversation(state['messages'])
    result = _reflection(rules, convo)
    info = {"default": {"rules": result}}

    return {"info": info, "userAcceptedText": False}


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
