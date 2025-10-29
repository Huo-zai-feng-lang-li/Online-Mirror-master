# Cursor Rules 说明

这个目录包含了 Online Mirror 项目的 Cursor AI 规则文件，帮助 AI 更好地理解项目结
构和开发规范。

## 📋 规则文件列表

### 1. project-structure.mdc

**类型**: Always Apply (自动应用)  
**作用**: 项目整体结构和架构说明

- 核心文件功能
- 技术栈说明
- 部署环境配置
- 开发约定

### 2. deployment.mdc

**类型**: Manual Apply (手动应用)  
**触发**: 部署相关问题  
**作用**: Cloudflare 部署流程和最佳实践

- 部署命令
- 环境配置
- 常见问题解决
- 分支管理

### 3. ui-components.mdc

**类型**: HTML Files (\*.html)  
**作用**: UI 组件和交互设计规范

- 禁止使用原生弹窗
- 自定义 Toast 和对话框
- 标准组件样式
- 骨架屏实现

### 4. api-config.mdc

**类型**: Manual Apply (手动应用)  
**触发**: API 相关开发  
**作用**: API 配置和请求规范

- API 地址配置
- 正确的调用方式
- 性能优化技巧
- CORS 配置

### 5. performance-security.mdc

**类型**: Manual Apply (手动应用)  
**触发**: 性能或安全相关问题  
**作用**: 性能优化和安全最佳实践

- 极速拍照实现（10ms 优化）
- 图片优化（JPEG 0.7）
- 先跳转后上传
- 安全防护
- 错误处理

### 6. url-encoding.mdc

**类型**: Manual Apply (手动应用)  
**触发**: URL 编码和参数处理  
**作用**: URL 编码和参数处理规范

- Base64 编码策略
- URL 长度优化（缩短 36%）
- 参数加密隐藏
- 为什么不能用 POST
- 向后兼容处理

### 7. link-generation.mdc

**类型**: Manual Apply (手动应用)  
**触发**: 链接生成相关问题  
**作用**: 链接生成和优化策略

- 直接生成原始链接（即时）
- 为什么去掉短链接
- URL 结构优化
- 生成速度优化（0ms）
- 最佳实践

### 8. shortlink-integration.mdc

**类型**: Manual Apply (手动应用)  
**触发**: 短链接集成（已弃用）  
**作用**: 短链接集成说明（仅供参考）

- 9lnk.io API 使用
- 集成实现（已移除）
- 降级策略
- 注意事项

## 🎯 使用方法

### Cursor AI 自动使用

- `project-structure.mdc` 会在每次对话时自动加载
- `ui-components.mdc` 会在编辑 HTML 文件时自动加载

### 手动引用规则

在 Cursor 对话中使用 `@` 符号引用规则：

```
@deployment 如何部署到 production 分支？
@api-config 如何正确调用 API？
@performance-security 如何优化拍照速度？
@url-encoding URL 参数如何编码？
@link-generation 如何生成链接？
```

## 📝 规则维护

当项目发生重大变更时，记得更新相关规则：

1. **新增功能** → 更新 `project-structure.mdc`
2. **部署流程变更** → 更新 `deployment.mdc`
3. **UI 组件变更** → 更新 `ui-components.mdc`
4. **API 变更** → 更新 `api-config.mdc`
5. **性能/安全优化** → 更新 `performance-security.mdc`
6. **URL 编码变更** → 更新 `url-encoding.mdc`
7. **链接生成策略** → 更新 `link-generation.mdc`

## 🔄 规则更新历史

- **2025-10-29**: 初始版本，基于项目重构后的最佳实践创建
- **2025-10-29**: 新增 `url-encoding.mdc` 和 `link-generation.mdc`
- **2025-10-29**: 更新 `performance-security.mdc` - 添加 10ms 极速优化、JPEG
  0.7、先跳转后上传等最新实践
- **2025-10-29**: 去掉短链接服务，优化为直接生成原始链接（即时，0 延迟）
