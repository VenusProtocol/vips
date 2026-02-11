---
allowed-tools: Bash(gh issue view:*), Bash(gh search:*), Bash(gh issue list:*), Bash(gh pr comment:*), Bash(gh pr diff:*), Bash(gh pr view:*), Bash(gh pr list:*), mcp__github_inline_comment__create_inline_comment
description: Code review a pull request
---

Review the given PR. `gh` CLI is preferrable.

## Planning

**IMPORTANT**: Follow the Planning Sessions workflow in CLAUDE.md strictly — never start working before your plan is confirmed.

## Principles

1. Independent calculation - never trust comments
2. Verify all values - don't verify one and assume others correct
3. Check source code - not just ABIs or tests
4. Systematic checklist - don't rely on intuition
5. **Bug require reproduction tests** - for any PR related to bug, provide enhanced tests that:
   - **Pre-fix**: Reproduce the bug (test should fail/revert before the fix)
   - **Post-fix**: Verify the fix works (same scenario should pass after the fix)
   - Apply these tests to the PR repo and include them in the report

## Steps

1. **Identify PR type**:

   - If VIP-related (vips repo, governance, timelock): load `vip-expert` agent for checklist and context
   - Otherwise: general code review

2. **Gather context** (parallel haiku agents):

   - Find CLAUDE.md files in affected directories
   - Get PR summary, can refer those as ref but never trust

3. Jot down the checklist in planning doc with the context collected in step 1 and 2

4. **Review** (parallel agents)

   - 1x Opus: to fully review security, logic bugs in general
   - 1x Opus: review but put more focus on checklist

5. **Output**: Write detailed `review_report.md` in planning directory

## High Signal Only

**Flag**: compile/parse errors, definite wrong results, clear CLAUDE.md violations

## Report Format

The final `review_report.md` must include:

```markdown
# PR Review Report

## Summary

- PR: [link]
- Title: ...
- Type: VIP / General
- Verdict: LGTM / CHANGES REQUESTED / BLOCKED

## Checklist

**IMPORTANT**: Use table format for clear, verifiable results. Each item MUST have:

1. **Status**: ✅ PASS / ⚠️ ISSUE / ❌ FAIL
2. **Verification Method**: How it was verified (e.g., "on-chain call", "code inspection", "cross-reference with X")
3. **Evidence**: Concrete proof (exact command output, calculation, or quote)

### Preferred Table Format

| #   | Item         | Status  | Verification Method | Evidence                                                                              |
| --- | ------------ | ------- | ------------------- | ------------------------------------------------------------------------------------- |
| 1.1 | [Check item] | ✅ PASS | [Method used]       | [Concrete proof - e.g., `cast call ... returns "expected"` or `code line:XX shows Y`] |
| 1.2 | [Check item] | ❌ FAIL | [Method used]       | [What was found vs expected]                                                          |

### Example (Address Verification)

| Token | Address       | On-Chain Symbol | Status  |
| ----- | ------------- | --------------- | ------- |
| USDT  | `0x55d398...` | `USDT`          | ✅ PASS |

**Verification**: `cast call <address> "symbol()(string)"` on BSC mainnet

### Example (Parameter Verification)

| #   | Item       | Expected | Actual | Status  | Evidence                                                |
| --- | ---------- | -------- | ------ | ------- | ------------------------------------------------------- |
| 3.1 | Supply Cap | 25,000   | 25,000 | ✅ PASS | `parseUnits("25000", 18)` in `riskParameters.supplyCap` |

### Detailed Format (when needed)

For complex items requiring more explanation:

- **Status**: ✅ PASS / ⚠️ ISSUE / ❌ FAIL
- **Verification Method**: [How this was verified]
- **Process**: [Step-by-step what was done]
- **Evidence**: [Links, calculations, or quotes from source]
- **Finding**: [Result or issue found]

## Issues Found

| #   | Severity | Location | Description | Evidence |
| --- | -------- | -------- | ----------- | -------- |

## Verified Items

[Summary table of all passed checks]

## Test Execution Scripts

Provide copy-pasteable commands for the user to reproduce the test results. Include:

1. **Clone/checkout command** - with all necessary git operations
2. **Enhanced test file** (if tests were supplemented) - use heredoc (`cat > file << 'EOF'`) to embed the full test content
   - For **bug fix PRs**: Must include both bug reproduction test (pre-fix → revert) and fix verification test (post-fix → success)
3. **Test run commands** - include required environment variables inline (e.g., `ARCHIVE_NODE_xxx=... yarn hardhat test ...`)

Example format:

# Step 1: Clone and checkout

cd /tmp && rm -rf repo-name && \
gh repo clone Owner/Repo repo-name -- --depth 50 && \
cd repo-name && \
git fetch origin pull/XXX/head:pr-XXX && \
git checkout pr-XXX && \
yarn install

# Step 2: Apply enhanced test (if applicable)

cat > path/to/test.ts << 'EOF'
// ... full test content ...
// For bug fix PRs, include:
// - Pre-fix test: reproduce bug (should revert before upgrade/fix)
// - Post-fix test: verify fix (same scenario should succeed after)
EOF

# Step 3: Run test

cd /tmp/repo-name && \
ENV_VAR=value \
yarn hardhat test path/to/test.ts --fork network

## Raw Notes

[Link to notes.md or inline subagent outputs]
```
