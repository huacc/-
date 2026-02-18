# 心理分析系统 API接口协议文档

> **版本**: v1.0
> **编制日期**: 2026-02-14
> **适用阶段**: P0 MVP基础版
> **文档状态**: 正式版

---

## 文档说明

本文档定义了心理分析系统P0阶段的完整API接口协议，作为前后端开发的统一参考。

**文档用途**：
- 前后端开发人员的接口契约
- API测试和集成的参考文档
- 接口版本管理和变更追踪
- 第三方系统集成指南

**相关文档**：
- 《心理分析系统_全栈架构设计_v1.0.md》
- 《心理分析系统_后端详细设计文档_v1.0.md》
- 《心理分析系统_前端架构设计_v1.0.md》

---

## 目录

1. [接口规范说明](#1-接口规范说明)
2. [通用定义](#2-通用定义)
3. [模型管理API](#3-模型管理api)
4. [提示词管理API](#4-提示词管理api)
5. [元本体管理API](#5-元本体管理api)
6. [知识图谱API](#6-知识图谱api)
7. [数据模型定义](#7-数据模型定义)
8. [附录](#8-附录)

---

## 1. 接口规范说明

### 1.1 基础信息

| 项目 | 说明 |
|------|------|
| **协议** | HTTP/1.1, HTTPS |
| **基础URL** | `http://localhost:8000` (开发环境) |
| **API前缀** | `/api/v1` |
| **编码** | UTF-8 |
| **数据格式** | JSON |
| **日期格式** | ISO 8601 (`YYYY-MM-DDTHH:mm:ss.sssZ`) |

### 1.2 认证方式

**P0阶段**: 无认证（单用户系统）

**P1阶段**: Bearer Token认证
```http
Authorization: Bearer <access_token>
```

### 1.3 请求规范

#### 1.3.1 请求头

```http
Content-Type: application/json
Accept: application/json
```

#### 1.3.2 请求方法

| 方法 | 用途 | 幂等性 |
|------|------|--------|
| GET | 查询资源 | ✓ |
| POST | 创建资源 | ✗ |
| PUT | 完整更新资源 | ✓ |
| PATCH | 部分更新资源 | ✗ |
| DELETE | 删除资源 | ✓ |

#### 1.3.3 分页参数

查询列表接口统一使用以下分页参数：

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| skip | integer | 否 | 0 | 跳过的记录数 |
| limit | integer | 否 | 20 | 返回的记录数（最大100） |

### 1.4 响应规范

#### 1.4.1 成功响应

**格式**：
```json
{
  "code": 0,
  "message": "success",
  "data": <响应数据>
}
```

**分页响应**：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [<数据列表>],
    "total": 100,
    "skip": 0,
    "limit": 20
  }
}
```

#### 1.4.2 错误响应

**格式**：
```json
{
  "code": <错误码>,
  "message": "<错误描述>",
  "detail": "<详细错误信息>",
  "errors": [
    {
      "field": "<字段名>",
      "message": "<字段错误信息>"
    }
  ]
}
```

**HTTP状态码**：

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 204 | No Content | 删除成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未认证 |
| 403 | Forbidden | 无权限 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突（如重复创建、依赖冲突） |
| 422 | Unprocessable Entity | 数据验证失败 |
| 429 | Too Many Requests | 请求过于频繁 |
| 500 | Internal Server Error | 服务器内部错误 |

#### 1.4.3 错误码定义

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数验证失败 |
| 1002 | 资源不存在 |
| 1003 | 资源已存在 |
| 1004 | 资源冲突 |
| 2001 | 模型调用失败 |
| 2002 | 提示词渲染失败 |
| 3001 | 本体验证失败 |
| 3002 | 知识图谱查询失败 |
| 5000 | 服务器内部错误 |

### 1.5 SSE流式响应规范

**适用接口**：
- `/api/v1/prompts/{id}/test` (提示词测试)
- `/api/v1/kg/query/rag` (RAG查询)

**响应格式**：
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: progress
data: {"message": "正在分析意图..."}

event: result
data: {"answer": "分析结果...", "cypher": "MATCH..."}

event: done
data: {"token_usage": {...}, "total_time": 3.2}
```

**事件类型**：

| 事件类型 | 说明 | 数据格式 |
|---------|------|---------|
| progress | 进度更新 | `{"message": string}` |
| fallback | 降级通知 | `{"level": number, "reason": string}` |
| result | 结果数据 | `{"answer": string, "cypher": string, ...}` |
| error | 错误信息 | `{"message": string}` |
| done | 完成信号 | `{"token_usage": {...}, "total_time": number}` |

### 1.6 限流策略

| 限流级别 | 限制 | 说明 |
|---------|------|------|
| 全局限流 | 100次/分钟 | 所有API请求 |
| 模型调用限流 | 10次/分钟 | 涉及LLM调用的接口 |

**限流响应**：
```json
HTTP/1.1 429 Too Many Requests
Retry-After: 60

{
  "code": 429,
  "message": "请求过于频繁，请等待60秒后重试"
}
```

---

## 2. 通用定义

### 2.1 通用数据类型

#### 2.1.1 UUID
```
格式: "550e8400-e29b-41d4-a716-446655440000"
说明: 资源唯一标识符
```

#### 2.1.2 时间戳
```
格式: "2026-02-14T10:30:00.000Z"
说明: ISO 8601格式，UTC时区
```

#### 2.1.3 枚举类型

**ModelProvider** (模型提供商):
```
"openai" | "anthropic" | "google" | "doubao" | "tongyi" | "custom"
```

**ModelStatus** (模型状态):
```
"active" | "inactive" | "error" | "checking"
```

**OntologyLevel** (本体层级):
```
0 | 1 | 2
```

**OntologyType** (本体类型):
```
"Entity" | "Event" | "State" | "Observable" | "Rule" | "ModelConcept"
```

**PropertyDataType** (属性数据类型):
```
"string" | "integer" | "float" | "boolean" | "date" | "datetime" |
"enum" | "text" | "url" | "json" | "array" | "range" | "duration" | "geo"
```

**RelationType** (关系类型，29种):
```typescript
// 通用关系（14种）
"IS_A" | "HAS_A" | "PART_OF" | "CONTAINS" |
"OBSERVED_AS" | "EVIDENCE_OF" | "TRIGGERS" | "INFLUENCES" |
"HAS_HISTORY" | "USES" | "DERIVES" | "MITIGATES" |
"PRECEDES" | "IN_ENVIRONMENT" |

// 心理学特定关系（15种）
"INDICATES" | "SUGGESTS" | "SHAPES" | "MODERATES" |
"AFFECTS" | "POSSESSES" | "PARTICIPATES_IN" | "EXPERIENCES" |
"HAS" | "IMPACTS" | "SHAPES_BY" | "INFLUENCED_BY" |
"REFLECTS" | "FOLLOWS" | "DEVELOPS_INTO"
```

### 2.2 通用响应模型

#### ApiResponse<T>
```typescript
{
  code: number;        // 0表示成功
  message: string;     // 响应消息
  data: T;             // 响应数据
}
```

#### PaginatedResponse<T>
```typescript
{
  items: T[];          // 数据列表
  total: number;       // 总记录数
  skip: number;        // 跳过的记录数
  limit: number;       // 返回的记录数
}
```

---

## 3. 模型管理API

### 3.1 获取模型提供商列表

**接口路径**: `GET /api/v1/models/providers`

**接口描述**: 获取已注册的模型提供商列表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | integer | 否 | 跳过的记录数，默认0 |
| limit | integer | 否 | 返回的记录数，默认20 |
| provider_type | string | 否 | 过滤提供商类型 |
| status | string | 否 | 过滤状态（active/inactive） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "provider_id": "openai_001",
        "name": "OpenAI",
        "provider_type": "openai",
        "status": "active",
        "api_base_url": "https://api.openai.com/v1",
        "models_count": 3,
        "created_at": "2026-02-14T10:00:00.000Z",
        "updated_at": "2026-02-14T10:00:00.000Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 20
  }
}
```

### 3.2 创建模型提供商

**接口路径**: `POST /api/v1/models/providers`

**接口描述**: 注册新的模型提供商

**请求体**:
```json
{
  "name": "OpenAI",
  "provider_type": "openai",
  "api_key": "sk-xxx",
  "api_base_url": "https://api.openai.com/v1",
  "config": {
    "timeout": 60,
    "max_retries": 3
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 提供商名称 |
| provider_type | string | 是 | 提供商类型（openai/anthropic/google/doubao/tongyi/custom） |
| api_key | string | 是 | API密钥 |
| api_base_url | string | 否 | API基础URL |
| config | object | 否 | 额外配置 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "provider_id": "openai_001",
    "name": "OpenAI",
    "provider_type": "openai",
    "status": "active",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 3.3 更新模型提供商

**接口路径**: `PUT /api/v1/models/providers/{id}`

**接口描述**: 更新模型提供商配置

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 提供商ID |

**请求体**:
```json
{
  "name": "OpenAI Updated",
  "api_key": "sk-new-xxx",
  "config": {
    "timeout": 90
  }
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "provider_id": "openai_001",
    "name": "OpenAI Updated",
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 3.4 删除模型提供商

**接口路径**: `DELETE /api/v1/models/providers/{id}`

**接口描述**: 删除模型提供商（需确保无关联的模型配置）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 提供商ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**:
```json
{
  "code": 1004,
  "message": "资源冲突",
  "detail": "该提供商下存在3个模型配置，无法删除"
}
```

### 3.5 获取模型配置列表

**接口路径**: `GET /api/v1/models/configs`

**接口描述**: 获取模型配置列表

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | integer | 否 | 跳过的记录数，默认0 |
| limit | integer | 否 | 返回的记录数，默认20 |
| provider_id | string | 否 | 过滤提供商ID |
| status | string | 否 | 过滤状态（active/inactive/error） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "model_id": "gpt-4",
        "model_name": "GPT-4",
        "provider_id": "openai_001",
        "provider_name": "OpenAI",
        "status": "active",
        "config": {
          "temperature": 0.7,
          "max_tokens": 4096
        },
        "fallback_model_id": "claude-3",
        "health_status": "healthy",
        "last_health_check": "2026-02-14T10:30:00.000Z",
        "created_at": "2026-02-14T10:00:00.000Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 20
  }
}
```

### 3.6 创建模型配置

**接口路径**: `POST /api/v1/models/configs`

**接口描述**: 创建新的模型配置

**请求体**:
```json
{
  "model_id": "gpt-4",
  "model_name": "GPT-4",
  "provider_id": "openai_001",
  "config": {
    "temperature": 0.7,
    "max_tokens": 4096,
    "top_p": 1.0
  },
  "fallback_model_id": "claude-3",
  "priority": 1
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| model_id | string | 是 | 模型标识符 |
| model_name | string | 是 | 模型显示名称 |
| provider_id | string | 是 | 提供商ID |
| config | object | 否 | 模型参数配置 |
| fallback_model_id | string | 否 | 备用模型ID |
| priority | integer | 否 | 优先级（用于调度） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "model_id": "gpt-4",
    "model_name": "GPT-4",
    "status": "active",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 3.7 更新模型配置

**接口路径**: `PUT /api/v1/models/configs/{id}`

**接口描述**: 更新模型配置

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模型ID |

**请求体**:
```json
{
  "config": {
    "temperature": 0.8,
    "max_tokens": 8192
  },
  "fallback_model_id": "gpt-3.5-turbo"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "model_id": "gpt-4",
    "config": {
      "temperature": 0.8,
      "max_tokens": 8192
    },
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 3.8 测试模型连通性

**接口路径**: `POST /api/v1/models/configs/{id}/test`

**接口描述**: 测试模型连通性和可用性

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模型ID |

**请求体**:
```json
{
  "test_prompt": "Hello, this is a test."
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "status": "success",
    "response": "Hello! I'm working correctly.",
    "latency": 1.23,
    "token_usage": {
      "prompt_tokens": 6,
      "completion_tokens": 8,
      "total_tokens": 14
    }
  }
}
```

**错误响应**:
```json
{
  "code": 2001,
  "message": "模型调用失败",
  "detail": "API key invalid or expired"
}
```

---

## 4. 提示词管理API

### 4.1 获取分类树

**接口路径**: `GET /api/v1/prompts/categories`

**接口描述**: 获取提示词分类树结构

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "category_id": "cat_001",
      "name": "知识提取",
      "parent_id": null,
      "children": [
        {
          "category_id": "cat_002",
          "name": "实体提取",
          "parent_id": "cat_001",
          "children": []
        }
      ]
    }
  ]
}
```

### 4.2 创建分类

**接口路径**: `POST /api/v1/prompts/categories`

**接口描述**: 创建新的提示词分类

**请求体**:
```json
{
  "name": "知识提取",
  "parent_id": null,
  "description": "用于知识提取的提示词模板"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "category_id": "cat_001",
    "name": "知识提取",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 4.3 获取模板列表

**接口路径**: `GET /api/v1/prompts/templates`

**接口描述**: 获取提示词模板列表（支持分页和筛选）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | integer | 否 | 跳过的记录数，默认0 |
| limit | integer | 否 | 返回的记录数，默认20 |
| category_id | string | 否 | 过滤分类ID |
| status | string | 否 | 过滤状态（draft/published/archived） |
| search | string | 否 | 搜索关键词（名称/描述） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "template_id": "tpl_001",
        "name": "知识提取模板",
        "description": "从文档中提取结构化知识",
        "category_id": "cat_001",
        "category_name": "知识提取",
        "status": "published",
        "version": 3,
        "variables": ["document", "schema"],
        "created_at": "2026-02-14T10:00:00.000Z",
        "updated_at": "2026-02-14T11:00:00.000Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 20
  }
}
```

### 4.4 创建模板

**接口路径**: `POST /api/v1/prompts/templates`

**接口描述**: 创建新的提示词模板

**请求体**:
```json
{
  "name": "知识提取模板",
  "description": "从文档中提取结构化知识",
  "category_id": "cat_001",
  "content": "请从以下文档中提取知识：\n\n{{document}}\n\n按照以下Schema提取：\n{{schema}}",
  "variables": ["document", "schema"],
  "model_id": "gpt-4",
  "config": {
    "temperature": 0.3,
    "max_tokens": 4096
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 模板名称 |
| description | string | 否 | 模板描述 |
| category_id | string | 是 | 分类ID |
| content | string | 是 | 模板内容（Jinja2格式） |
| variables | array | 是 | 变量列表 |
| model_id | string | 否 | 默认模型ID |
| config | object | 否 | 模型参数配置 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "template_id": "tpl_001",
    "name": "知识提取模板",
    "status": "draft",
    "version": 1,
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 4.5 获取模板详情

**接口路径**: `GET /api/v1/prompts/templates/{id}`

**接口描述**: 获取提示词模板详细信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "template_id": "tpl_001",
    "name": "知识提取模板",
    "description": "从文档中提取结构化知识",
    "category_id": "cat_001",
    "category_name": "知识提取",
    "content": "请从以下文档中提取知识：\n\n{{document}}\n\n按照以下Schema提取：\n{{schema}}",
    "variables": ["document", "schema"],
    "model_id": "gpt-4",
    "config": {
      "temperature": 0.3,
      "max_tokens": 4096
    },
    "status": "published",
    "version": 3,
    "created_at": "2026-02-14T10:00:00.000Z",
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 4.6 更新模板

**接口路径**: `PUT /api/v1/prompts/templates/{id}`

**接口描述**: 更新提示词模板（会创建新版本）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**请求体**:
```json
{
  "name": "知识提取模板 v2",
  "content": "请从以下文档中提取知识：\n\n{{document}}\n\n按照以下Schema提取：\n{{schema}}\n\n注意：提取时保持原文语义",
  "config": {
    "temperature": 0.2
  }
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "template_id": "tpl_001",
    "version": 4,
    "updated_at": "2026-02-14T12:00:00.000Z"
  }
}
```

### 4.7 删除模板

**接口路径**: `DELETE /api/v1/prompts/templates/{id}`

**接口描述**: 删除提示词模板

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 4.8 复制模板

**接口路径**: `POST /api/v1/prompts/templates/{id}/copy`

**接口描述**: 复制提示词模板

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**请求体**:
```json
{
  "name": "知识提取模板（副本）"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "template_id": "tpl_002",
    "name": "知识提取模板（副本）",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 4.9 获取版本历史

**接口路径**: `GET /api/v1/prompts/templates/{id}/versions`

**接口描述**: 获取提示词模板的版本历史

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "version": 3,
      "content": "请从以下文档中提取知识...",
      "created_at": "2026-02-14T11:00:00.000Z",
      "created_by": "user_001",
      "is_current": true
    },
    {
      "version": 2,
      "content": "请从以下文档中提取知识...",
      "created_at": "2026-02-14T10:30:00.000Z",
      "created_by": "user_001",
      "is_current": false
    }
  ]
}
```

### 4.10 测试提示词

**接口路径**: `POST /api/v1/prompts/templates/{id}/test`

**接口描述**: 测试提示词模板（调用LLM，SSE流式响应）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 模板ID |

**请求体**:
```json
{
  "variables": {
    "document": "张三是一位心理咨询师...",
    "schema": "{\"entities\": [\"Person\", \"Profession\"]}"
  },
  "model_id": "gpt-4"
}
```

**响应格式**: SSE流式响应

**事件示例**:
```
event: progress
data: {"message": "正在渲染提示词..."}

event: progress
data: {"message": "正在调用模型..."}

event: result
data: {"output": "提取的知识：...", "rendered_prompt": "请从以下文档中提取知识..."}

event: done
data: {"latency": 2.5, "token_usage": {"total_tokens": 150}, "used_fallback": false}
```

**错误事件**:
```
event: error
data: {"message": "变量缺失：schema"}
```

---

## 5. 元本体管理API

### 5.1 获取本体列表

**接口路径**: `GET /api/v1/ontologies`

**接口描述**: 获取本体定义列表（支持分类筛选）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | integer | 否 | 跳过的记录数，默认0 |
| limit | integer | 否 | 返回的记录数，默认20 |
| type | string | 否 | 过滤本体类型（Entity/Event/State/Observable/Rule/ModelConcept） |
| search | string | 否 | 搜索关键词（名称/描述） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "ontology_id": "PersonalityTrait",
        "name": "人格特质",
        "type": "Entity",
        "description": "描述个体稳定的心理特征",
        "properties_count": 5,
        "relationships_count": 3,
        "created_at": "2026-02-14T10:00:00.000Z",
        "updated_at": "2026-02-14T11:00:00.000Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 20
  }
}
```

### 5.2 创建本体定义

**接口路径**: `POST /api/v1/ontologies`

**接口描述**: 创建新的本体定义

**请求体**:
```json
{
  "ontology_id": "PersonalityTrait",
  "name": "人格特质",
  "type": "Entity",
  "description": "描述个体稳定的心理特征",
  "properties": [
    {
      "property_id": "trait_name",
      "name": "特质名称",
      "data_type": "string",
      "required": true,
      "description": "特质的名称"
    },
    {
      "property_id": "intensity",
      "name": "强度",
      "data_type": "integer",
      "required": false,
      "validation": {
        "min": 1,
        "max": 10
      }
    }
  ],
  "relationships": [
    {
      "relation_type": "INFLUENCES",
      "target_ontology_id": "Behavior",
      "description": "人格特质影响行为表现"
    }
  ]
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ontology_id | string | 是 | 本体标识符（唯一） |
| name | string | 是 | 本体名称 |
| type | string | 是 | 本体类型（6种Level 1类型之一） |
| description | string | 否 | 本体描述 |
| properties | array | 是 | 属性定义列表 |
| relationships | array | 否 | 关系定义列表 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "ontology_id": "PersonalityTrait",
    "name": "人格特质",
    "type": "Entity",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 5.3 获取本体详情

**接口路径**: `GET /api/v1/ontologies/{id}`

**接口描述**: 获取本体详细信息（含属性和关系）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "ontology_id": "PersonalityTrait",
    "name": "人格特质",
    "type": "Entity",
    "description": "描述个体稳定的心理特征",
    "properties": [
      {
        "property_id": "trait_name",
        "name": "特质名称",
        "data_type": "string",
        "required": true,
        "description": "特质的名称"
      }
    ],
    "relationships": [
      {
        "relation_id": "rel_001",
        "relation_type": "INFLUENCES",
        "target_ontology_id": "Behavior",
        "target_ontology_name": "行为",
        "description": "人格特质影响行为表现"
      }
    ],
    "created_at": "2026-02-14T10:00:00.000Z",
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 5.4 更新本体定义

**接口路径**: `PUT /api/v1/ontologies/{id}`

**接口描述**: 更新本体定义

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |

**请求体**:
```json
{
  "name": "人格特质（更新）",
  "description": "描述个体稳定的心理特征和行为倾向"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "ontology_id": "PersonalityTrait",
    "name": "人格特质（更新）",
    "updated_at": "2026-02-14T12:00:00.000Z"
  }
}
```

### 5.5 删除本体定义

**接口路径**: `DELETE /api/v1/ontologies/{id}`

**接口描述**: 删除本体定义（需确保无关联的知识实例）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误响应**:
```json
{
  "code": 1004,
  "message": "资源冲突",
  "detail": "该本体下存在15个知识实例，无法删除"
}
```

### 5.6 获取本体分类树

**接口路径**: `GET /api/v1/ontologies/tree`

**接口描述**: 获取本体分类树（按类型分类）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "type": "Entity",
      "type_name": "实体",
      "count": 10,
      "ontologies": [
        {
          "ontology_id": "PersonalityTrait",
          "name": "人格特质"
        }
      ]
    },
    {
      "type": "Event",
      "type_name": "事件",
      "count": 5,
      "ontologies": []
    }
  ]
}
```

### 5.7 获取本体关系图数据

**接口路径**: `GET /api/v1/ontologies/graph`

**接口描述**: 获取本体关系图数据（G6格式，供前端可视化）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| system_id | string | 否 | 本体体系ID（不传则返回所有） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "nodes": [
      {
        "id": "PersonalityTrait",
        "label": "人格特质",
        "type": "Entity",
        "properties_count": 5
      },
      {
        "id": "Behavior",
        "label": "行为",
        "type": "Event",
        "properties_count": 3
      }
    ],
    "edges": [
      {
        "id": "edge_001",
        "source": "PersonalityTrait",
        "target": "Behavior",
        "label": "INFLUENCES",
        "relation_type": "INFLUENCES"
      }
    ]
  }
}
```

### 5.8 添加属性定义

**接口路径**: `POST /api/v1/ontologies/{id}/attributes`

**接口描述**: 为本体添加属性定义

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |

**请求体**:
```json
{
  "property_id": "stability",
  "name": "稳定性",
  "data_type": "integer",
  "required": false,
  "validation": {
    "min": 1,
    "max": 10
  },
  "description": "特质的稳定性评分"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "property_id": "stability",
    "name": "稳定性",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 5.9 更新属性定义

**接口路径**: `PUT /api/v1/ontologies/{id}/attributes/{attrId}`

**接口描述**: 更新本体的属性定义

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |
| attrId | string | 是 | 属性ID |

**请求体**:
```json
{
  "name": "稳定性（更新）",
  "validation": {
    "min": 0,
    "max": 100
  }
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "property_id": "stability",
    "name": "稳定性（更新）",
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 5.10 添加关系定义

**接口路径**: `POST /api/v1/ontologies/{id}/relationships`

**接口描述**: 为本体添加关系定义

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 本体ID |

**请求体**:
```json
{
  "relation_type": "TRIGGERS",
  "target_ontology_id": "EmotionalResponse",
  "description": "人格特质触发情绪反应"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "relation_id": "rel_002",
    "relation_type": "TRIGGERS",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

### 5.11 获取版本历史

**接口路径**: `GET /api/v1/ontologies/versions`

**接口描述**: 获取本体体系的版本历史

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| system_id | string | 是 | 本体体系ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "version": 3,
      "version_tag": "v1.0.3",
      "description": "添加了情绪相关本体",
      "created_at": "2026-02-14T11:00:00.000Z",
      "created_by": "user_001",
      "is_current": true
    },
    {
      "version": 2,
      "version_tag": "v1.0.2",
      "description": "更新了人格特质定义",
      "created_at": "2026-02-14T10:30:00.000Z",
      "created_by": "user_001",
      "is_current": false
    }
  ]
}
```

### 5.12 创建版本快照

**接口路径**: `POST /api/v1/ontologies/versions`

**接口描述**: 创建本体体系的版本快照

**请求体**:
```json
{
  "system_id": "sys_001",
  "description": "P0阶段基础本体定义"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "version": 4,
    "version_tag": "v1.0.4",
    "created_at": "2026-02-14T12:00:00.000Z"
  }
}
```

### 5.13 AI辅助建模

**接口路径**: `POST /api/v1/ontologies/ai-suggest`

**接口描述**: AI辅助本体建模（输入自然语言描述，返回建议的本体结构，不直接落库）

**请求体**:
```json
{
  "description": "创伤后应激障碍的心理特征，包括闪回、回避行为、过度警觉等症状",
  "existing_schema": {
    "ontologies": ["PersonalityTrait", "Behavior"]
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| description | string | 是 | 自然语言描述 |
| existing_schema | object | 否 | 现有Schema（用于增量建模） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "suggested_ontologies": [
      {
        "ontology_id": "PTSD",
        "name": "创伤后应激障碍",
        "type": "State",
        "properties": [
          {
            "property_id": "severity",
            "name": "严重程度",
            "data_type": "integer"
          }
        ],
        "relationships": [
          {
            "relation_type": "HAS",
            "target_ontology_id": "Flashback"
          }
        ]
      }
    ],
    "confidence": 0.85
  }
}
```

---

## 6. 知识图谱API

### 6.1 获取知识节点列表

**接口路径**: `GET /api/v1/kg/nodes`

**接口描述**: 获取知识节点列表（支持分页和筛选）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| skip | integer | 否 | 跳过的记录数，默认0 |
| limit | integer | 否 | 返回的记录数，默认20 |
| ontology_id | string | 否 | 过滤本体类型 |
| search | string | 否 | 搜索关键词（节点属性） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "node_id": "node_001",
        "ontology_id": "PersonalityTrait",
        "ontology_name": "人格特质",
        "properties": {
          "trait_name": "外向性",
          "intensity": 8
        },
        "created_at": "2026-02-14T10:00:00.000Z",
        "updated_at": "2026-02-14T11:00:00.000Z"
      }
    ],
    "total": 1,
    "skip": 0,
    "limit": 20
  }
}
```

### 6.2 创建知识节点

**接口路径**: `POST /api/v1/kg/nodes`

**接口描述**: 创建新的知识节点

**请求体**:
```json
{
  "ontology_id": "PersonalityTrait",
  "properties": {
    "trait_name": "外向性",
    "intensity": 8,
    "description": "喜欢社交，活跃开朗"
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ontology_id | string | 是 | 本体类型ID |
| properties | object | 是 | 节点属性（需符合本体Schema定义） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "node_id": "node_001",
    "ontology_id": "PersonalityTrait",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "code": 3001,
  "message": "本体验证失败",
  "detail": "缺少必填属性：trait_name"
}
```

### 6.3 获取节点详情

**接口路径**: `GET /api/v1/kg/nodes/{id}`

**接口描述**: 获取知识节点详细信息

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "node_id": "node_001",
    "ontology_id": "PersonalityTrait",
    "ontology_name": "人格特质",
    "properties": {
      "trait_name": "外向性",
      "intensity": 8,
      "description": "喜欢社交，活跃开朗"
    },
    "relationships": [
      {
        "relation_id": "rel_001",
        "relation_type": "INFLUENCES",
        "target_node_id": "node_002",
        "target_node_label": "社交行为"
      }
    ],
    "created_at": "2026-02-14T10:00:00.000Z",
    "updated_at": "2026-02-14T11:00:00.000Z"
  }
}
```

### 6.4 更新知识节点

**接口路径**: `PUT /api/v1/kg/nodes/{id}`

**接口描述**: 更新知识节点属性

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点ID |

**请求体**:
```json
{
  "properties": {
    "intensity": 9,
    "description": "非常喜欢社交，极度活跃"
  }
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "node_id": "node_001",
    "updated_at": "2026-02-14T12:00:00.000Z"
  }
}
```

### 6.5 删除知识节点

**接口路径**: `DELETE /api/v1/kg/nodes/{id}`

**接口描述**: 删除知识节点（会同时删除相关的关系）

**路径参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | string | 是 | 节点ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

### 6.6 创建知识关系

**接口路径**: `POST /api/v1/kg/relationships`

**接口描述**: 创建知识节点之间的关系

**请求体**:
```json
{
  "source_node_id": "node_001",
  "target_node_id": "node_002",
  "relation_type": "INFLUENCES",
  "properties": {
    "strength": 0.8,
    "description": "外向性强烈影响社交行为"
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| source_node_id | string | 是 | 源节点ID |
| target_node_id | string | 是 | 目标节点ID |
| relation_type | string | 是 | 关系类型（29种预定义类型之一） |
| properties | object | 否 | 关系属性 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "relation_id": "rel_001",
    "relation_type": "INFLUENCES",
    "created_at": "2026-02-14T10:00:00.000Z"
  }
}
```

**错误响应**:
```json
{
  "code": 3001,
  "message": "本体验证失败",
  "detail": "关系类型INFLUENCES不允许从PersonalityTrait指向Emotion"
}
```

### 6.7 获取图可视化数据

**接口路径**: `GET /api/v1/kg/graph`

**接口描述**: 获取知识图谱可视化数据（G6格式）

**请求参数**:

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| ontology_id | string | 否 | 过滤本体类型 |
| depth | integer | 否 | 查询深度，默认2 |
| root_node_id | string | 否 | 根节点ID（从该节点开始展开） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "nodes": [
      {
        "id": "node_001",
        "label": "外向性",
        "ontology_id": "PersonalityTrait",
        "ontology_name": "人格特质",
        "properties": {
          "intensity": 8
        }
      },
      {
        "id": "node_002",
        "label": "社交行为",
        "ontology_id": "Behavior",
        "ontology_name": "行为"
      }
    ],
    "edges": [
      {
        "id": "rel_001",
        "source": "node_001",
        "target": "node_002",
        "label": "INFLUENCES",
        "relation_type": "INFLUENCES"
      }
    ]
  }
}
```

### 6.8 批量导入知识

**接口路径**: `POST /api/v1/kg/import`

**接口描述**: 批量导入知识数据（支持JSON/CSV格式）

**请求体**:
```json
{
  "format": "json",
  "data": {
    "nodes": [
      {
        "ontology_id": "PersonalityTrait",
        "properties": {
          "trait_name": "外向性",
          "intensity": 8
        }
      }
    ],
    "relationships": [
      {
        "source_node_id": "node_001",
        "target_node_id": "node_002",
        "relation_type": "INFLUENCES"
      }
    ]
  }
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| format | string | 是 | 数据格式（json/csv） |
| data | object | 是 | 导入数据 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "imported_nodes": 10,
    "imported_relationships": 15,
    "failed_nodes": 0,
    "failed_relationships": 0,
    "errors": []
  }
}
```

### 6.9 知识自动提取

**接口路径**: `POST /api/v1/kg/extract`

**接口描述**: 基于本体Schema的知识自动提取（LLM驱动，返回预览数据，不直接落库）

**请求体**:
```json
{
  "document": "张三是一位心理咨询师，擅长认知行为疗法。他性格外向，善于倾听。",
  "ontology_id": "PersonalityTrait",
  "template_id": "tpl_knowledge_extraction"
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| document | string | 是 | 待提取的文档内容 |
| ontology_id | string | 是 | 本体Schema ID |
| template_id | string | 否 | 提示词模板ID（不传则使用默认模板） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "extracted_nodes": [
      {
        "ontology_id": "PersonalityTrait",
        "properties": {
          "trait_name": "外向",
          "description": "善于倾听"
        }
      }
    ],
    "extracted_relationships": [
      {
        "source_node_id": "temp_001",
        "target_node_id": "temp_002",
        "relation_type": "HAS"
      }
    ],
    "confidence": 0.85
  }
}
```

### 6.10 自然语言智能查询

**接口路径**: `POST /api/v1/kg/smart-query`

**接口描述**: 自然语言智能查询（SSE流式响应，内部使用RAG Method 5）

**请求体**:
```json
{
  "query": "找出所有外向性特质强度大于7的人格特质",
  "ontology_id": "PersonalityTrait"
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| query | string | 是 | 自然语言查询 |
| ontology_id | string | 否 | 限定本体范围 |

**响应格式**: SSE流式响应

**事件示例**:
```
event: progress
data: {"message": "正在分析查询意图..."}

event: progress
data: {"message": "正在生成查询语句..."}

event: fallback
data: {"level": 2, "reason": "Function Calling返回空结果，降级到Auto Cypher"}

event: result
data: {"answer": "找到3个符合条件的人格特质", "cypher": "MATCH (n:PersonalityTrait) WHERE n.intensity > 7 RETURN n", "nodes": [...]}

event: done
data: {"token_usage": {"total_tokens": 200}, "total_time": 3.5, "fallback_level": 2}
```

### 6.11 执行Cypher查询

**接口路径**: `POST /api/v1/kg/cypher`

**接口描述**: 直接执行Cypher查询语句

**请求体**:
```json
{
  "cypher": "MATCH (n:PersonalityTrait) WHERE n.intensity > 7 RETURN n LIMIT 10"
}
```

**请求字段说明**:

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| cypher | string | 是 | Cypher查询语句 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "results": [
      {
        "n": {
          "node_id": "node_001",
          "ontology_id": "PersonalityTrait",
          "properties": {
            "trait_name": "外向性",
            "intensity": 8
          }
        }
      }
    ],
    "execution_time": 0.15
  }
}
```

**错误响应**:
```json
{
  "code": 3002,
  "message": "知识图谱查询失败",
  "detail": "Cypher语法错误：Invalid input 'WHRE'"
}
```

### 6.12 获取查询工具列表

**接口路径**: `GET /api/v1/kg/query-tools`

**接口描述**: 获取可用的查询工具列表（Function Calling工具集）

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "tools": [
      {
        "name": "find_nodes_by_property",
        "description": "根据属性查找节点",
        "parameters": {
          "ontology_id": "string",
          "property_name": "string",
          "property_value": "any"
        }
      },
      {
        "name": "find_relationships",
        "description": "查找节点之间的关系",
        "parameters": {
          "source_node_id": "string",
          "relation_type": "string"
        }
      }
    ]
  }
}
```

---

## 7. 数据模型定义

### 7.1 模型管理相关模型

#### ModelProvider（模型提供商）
```typescript
{
  provider_id: string;           // 提供商ID
  name: string;                  // 提供商名称
  provider_type: ModelProviderType;  // 提供商类型
  api_key: string;               // API密钥（加密存储）
  api_base_url?: string;         // API基础URL
  config?: object;               // 额外配置
  status: ModelStatus;           // 状态
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

#### ModelConfig（模型配置）
```typescript
{
  model_id: string;              // 模型ID
  model_name: string;            // 模型名称
  provider_id: string;           // 提供商ID
  provider_name: string;         // 提供商名称
  config: {                      // 模型参数
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
  fallback_model_id?: string;    // 备用模型ID
  priority?: number;             // 优先级
  status: ModelStatus;           // 状态
  health_status?: string;        // 健康状态
  last_health_check?: string;    // 最后健康检查时间
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

### 7.2 提示词管理相关模型

#### PromptCategory（提示词分类）
```typescript
{
  category_id: string;           // 分类ID
  name: string;                  // 分类名称
  parent_id?: string;            // 父分类ID
  description?: string;          // 分类描述
  children?: PromptCategory[];   // 子分类
  created_at: string;            // 创建时间
}
```

#### PromptTemplate（提示词模板）
```typescript
{
  template_id: string;           // 模板ID
  name: string;                  // 模板名称
  description?: string;          // 模板描述
  category_id: string;           // 分类ID
  category_name: string;         // 分类名称
  content: string;               // 模板内容（Jinja2格式）
  variables: string[];           // 变量列表
  model_id?: string;             // 默认模型ID
  config?: object;               // 模型参数配置
  status: PromptStatus;          // 状态（draft/published/archived）
  version: number;               // 版本号
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

#### PromptVersion（提示词版本）
```typescript
{
  version: number;               // 版本号
  content: string;               // 版本内容
  created_at: string;            // 创建时间
  created_by: string;            // 创建者
  is_current: boolean;           // 是否当前版本
}
```

### 7.3 元本体管理相关模型

#### OntologyDefinition（本体定义）
```typescript
{
  ontology_id: string;           // 本体ID
  name: string;                  // 本体名称
  type: OntologyType;            // 本体类型
  description?: string;          // 本体描述
  properties: PropertyDefinition[];  // 属性定义列表
  relationships: RelationshipDefinition[];  // 关系定义列表
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

#### PropertyDefinition（属性定义）
```typescript
{
  property_id: string;           // 属性ID
  name: string;                  // 属性名称
  data_type: PropertyDataType;   // 数据类型
  required: boolean;             // 是否必填
  default_value?: any;           // 默认值
  validation?: object;           // 验证规则
  description?: string;          // 属性描述
}
```

#### RelationshipDefinition（关系定义）
```typescript
{
  relation_id: string;           // 关系ID
  relation_type: RelationType;   // 关系类型
  target_ontology_id: string;    // 目标本体ID
  target_ontology_name: string;  // 目标本体名称
  description?: string;          // 关系描述
  properties?: object;           // 关系属性
}
```

### 7.4 知识图谱相关模型

#### KnowledgeNode（知识节点）
```typescript
{
  node_id: string;               // 节点ID
  ontology_id: string;           // 本体类型ID
  ontology_name: string;         // 本体类型名称
  properties: object;            // 节点属性（符合本体Schema）
  created_at: string;            // 创建时间
  updated_at: string;            // 更新时间
}
```

#### KnowledgeRelationship（知识关系）
```typescript
{
  relation_id: string;           // 关系ID
  source_node_id: string;        // 源节点ID
  target_node_id: string;        // 目标节点ID
  relation_type: RelationType;   // 关系类型
  properties?: object;           // 关系属性
  created_at: string;            // 创建时间
}
```

#### GraphData（图数据，G6格式）
```typescript
{
  nodes: Array<{
    id: string;                  // 节点ID
    label: string;               // 节点标签
    ontology_id: string;         // 本体类型ID
    ontology_name: string;       // 本体类型名称
    properties?: object;         // 节点属性
  }>;
  edges: Array<{
    id: string;                  // 边ID
    source: string;              // 源节点ID
    target: string;              // 目标节点ID
    label: string;               // 边标签
    relation_type: string;       // 关系类型
  }>;
}
```

---

## 8. 附录

### 8.1 变更日志

| 版本 | 日期 | 变更内容 | 作者 |
|------|------|---------|------|
| v1.0 | 2026-02-14 | 初始版本，完成P0阶段所有API定义 | System |

### 8.2 常见问题

#### Q1: 如何处理API限流？
A: 当收到429状态码时，检查响应头中的`Retry-After`字段，等待指定秒数后重试。

#### Q2: SSE流式响应如何处理？
A: 使用EventSource API连接SSE端点，监听不同的事件类型（progress/fallback/result/error/done）。

#### Q3: 如何处理模型故障转移？
A: 在模型配置中设置`fallback_model_id`，当主模型失败时系统会自动切换到备用模型。响应中的`used_fallback`字段会标识是否使用了备用模型。

#### Q4: 本体验证失败如何处理？
A: 检查错误响应中的`errors`数组，其中包含具体的字段级错误信息。根据错误信息调整请求数据后重试。

### 8.3 示例代码

#### 调用提示词测试接口（SSE）
```javascript
const eventSource = new EventSource('/api/v1/prompts/templates/tpl_001/test');

eventSource.addEventListener('progress', (e) => {
  const data = JSON.parse(e.data);
  console.log('Progress:', data.message);
});

eventSource.addEventListener('result', (e) => {
  const data = JSON.parse(e.data);
  console.log('Result:', data.output);
});

eventSource.addEventListener('done', (e) => {
  const data = JSON.parse(e.data);
  console.log('Done:', data.latency, 'seconds');
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  const data = JSON.parse(e.data);
  console.error('Error:', data.message);
  eventSource.close();
});
```

#### 创建知识节点并建立关系
```javascript
// 1. 创建第一个节点
const node1 = await fetch('/api/v1/kg/nodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ontology_id: 'PersonalityTrait',
    properties: {
      trait_name: '外向性',
      intensity: 8
    }
  })
}).then(r => r.json());

// 2. 创建第二个节点
const node2 = await fetch('/api/v1/kg/nodes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ontology_id: 'Behavior',
    properties: {
      behavior_name: '社交行为'
    }
  })
}).then(r => r.json());

// 3. 建立关系
const relationship = await fetch('/api/v1/kg/relationships', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    source_node_id: node1.data.node_id,
    target_node_id: node2.data.node_id,
    relation_type: 'INFLUENCES'
  })
}).then(r => r.json());
```

### 8.4 相关文档

- [心理分析系统_全栈架构设计_v1.0.md](./心理分析系统_全栈架构设计_v1.0.md)
- [心理分析系统_后端详细设计文档_v1.0.md](./心理分析系统_后端详细设计文档_v1.0.md)
- [心理分析系统_前端架构设计_v1.0.md](./心理分析系统_前端架构设计_v1.0.md)
- [元本体数据模型需求文档_v1.0.md](../需求设计/元本体数据模型需求文档_v1.0.md)

---

**文档结束**
