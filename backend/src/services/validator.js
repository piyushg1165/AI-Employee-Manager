// validator.js
import { parse } from 'pgsql-ast-parser';

const allowedTables = ['employees'];
const allowedColumns = new Set(['id','name','email','phone','position','joining_date','employment_type','department','location','manager','experience_years','is_remote','skills','projects']);

// Cache for parsed ASTs to improve performance on repeated queries
const astCache = new Map();
const CACHE_SIZE_LIMIT = 100;

export function validateAndEnforceSelect(sql) {
    // Input validation
    if (!sql || typeof sql !== 'string') {
        throw new Error('Invalid SQL input: must be a non-empty string');
    }

    const trimmedSql = sql.trim();
    if (!trimmedSql) {
        throw new Error('Invalid SQL input: empty query');
    }

    // Check cache first for performance
    let ast;
    const cacheKey = trimmedSql.toLowerCase();
    
    if (astCache.has(cacheKey)) {
        ast = astCache.get(cacheKey);
    } else {
        try {
            ast = parse(trimmedSql);
            
            // Cache management - remove oldest entry if cache is full
            if (astCache.size >= CACHE_SIZE_LIMIT) {
                const firstKey = astCache.keys().next().value;
                astCache.delete(firstKey);
            }
            astCache.set(cacheKey, ast);
        } catch (err) {
            throw new Error(`Invalid SQL syntax: ${err.message}`);
        }
    }

    // Validate AST structure
    if (!Array.isArray(ast) || !ast.length) {
        throw new Error('Invalid SQL: no statements found');
    }

    if (ast.length > 1) {
        throw new Error('Only single SELECT queries are allowed');
    }

    const statement = ast[0];
    
    if (statement.type !== 'select') {
        throw new Error('Only SELECT queries are allowed');
    }

    // Validate FROM clause - handle JOINs
    if (!statement.from || !Array.isArray(statement.from)) {
        throw new Error('FROM clause is required');
    }

    // Extract all table names from FROM clause (including JOINs)
    const tableNames = extractAllTableNames(statement.from);
    
    if (tableNames.length === 0) {
        throw new Error('No valid tables found in FROM clause');
    }

    // Validate all tables are from allowed list
    const invalidTables = tableNames.filter(name => !allowedTables.includes(name.toLowerCase()));
    if (invalidTables.length > 0) {
        throw new Error(`Access to tables '${invalidTables.join(', ')}' is not allowed. Allowed tables: ${allowedTables.join(', ')}`);
    }

    // For self-joins, ensure all tables are the same allowed table
    const uniqueTables = [...new Set(tableNames.map(name => name.toLowerCase()))];
    if (uniqueTables.length > 1) {
        throw new Error(`Cross-table queries not allowed. Found tables: ${uniqueTables.join(', ')}`);
    }

    // Validate columns with better error handling
    if (!statement.columns || !Array.isArray(statement.columns)) {
        throw new Error('Invalid SELECT clause: no columns specified');
    }

    const invalidColumns = [];
    
    statement.columns.forEach((col, index) => {
        try {
            if (col.expr.type === 'star') {
                throw new Error('Wildcard (*) is not allowed. Please specify columns explicitly');
            }
            
            if (col.expr.type === 'ref') {
                let colName = extractColumnName(col.expr);
                
                if (colName && !allowedColumns.has(colName.toLowerCase())) {
                    invalidColumns.push(colName);
                }
            }
            
            // Handle function calls, expressions, etc.
            if (col.expr.type === 'call') {
                validateFunctionCall(col.expr);
            }
        } catch (err) {
            throw new Error(`Error in column ${index + 1}: ${err.message}`);
        }
    });

    if (invalidColumns.length > 0) {
        throw new Error(`Invalid columns: ${invalidColumns.join(', ')}. Allowed columns: ${Array.from(allowedColumns).join(', ')}`);
    }

    // Validate and enforce LIMIT with better logic
    let finalSql = trimmedSql;
    
    if (!statement.limit) {
        // More robust LIMIT addition
        finalSql = addLimitToQuery(finalSql);
    } else {
        // Validate existing LIMIT value
        const limitValue = statement.limit.count;
        if (limitValue && (typeof limitValue === 'object' && limitValue.value > 1000)) {
            throw new Error('LIMIT cannot exceed 1000 rows');
        }
    }

    // Additional security checks
    validateSecurityConstraints(statement);

    return finalSql;
}

function extractAllTableNames(fromClause) {
    const tableNames = [];
    
    function extractFromNode(node) {
        if (!node) return;
        
        // Handle regular table references
        if (node.name) {
            if (node.name.name) {
                tableNames.push(node.name.name);
            } else if (typeof node.name === 'string') {
                tableNames.push(node.name);
            }
        }
        
        // Handle JOINs recursively
        if (node.join) {
            if (Array.isArray(node.join)) {
                node.join.forEach(joinNode => {
                    extractFromNode(joinNode.from);
                });
            } else {
                extractFromNode(node.join.from);
            }
        }
    }
    
    // Process all FROM clause elements
    fromClause.forEach(extractFromNode);
    
    return tableNames;
}

function extractColumnName(ref) {
    if (Array.isArray(ref.name)) {
        // Handle qualified names like table.column
        return ref.name[ref.name.length - 1]?.name?.toLowerCase();
    } else if (typeof ref.name === 'string') {
        return ref.name.toLowerCase();
    } else if (ref.name?.name) {
        return ref.name.name.toLowerCase();
    }
    return null;
}

function validateFunctionCall(callExpr) {
    const allowedFunctions = new Set([
        'count', 'sum', 'avg', 'min', 'max', 
        'upper', 'lower', 'length', 'array_length',
        'unnest', 'exists'
    ]);
    
    const functionName = callExpr.function?.name?.toLowerCase();
    if (functionName && !allowedFunctions.has(functionName)) {
        throw new Error(`Function '${functionName}' is not allowed`);
    }
}

function addLimitToQuery(sql) {
    // Handle various SQL endings more robustly
    const cleanSql = sql.replace(/;\s*$/, '').trim();
    
    // Check if there's already a LIMIT clause (case-insensitive)
    if (/\blimit\s+\d+/i.test(cleanSql)) {
        return cleanSql;
    }
    
    return `${cleanSql} LIMIT 50`;
}

function validateSecurityConstraints(statement) {
    // Check for potentially dangerous patterns
    const sqlString = JSON.stringify(statement).toLowerCase();
    
    const dangerousPatterns = [
        'information_schema',
        'pg_catalog',
        'pg_user',
        'current_user',
        'session_user'
    ];
    
    for (const pattern of dangerousPatterns) {
        if (sqlString.includes(pattern)) {
            throw new Error(`Security violation: access to '${pattern}' is not allowed`);
        }
    }
}

// Utility function to clear cache if needed
export function clearValidatorCache() {
    astCache.clear();
}

// Export for testing
export const _internal = {
    extractColumnName,
    validateFunctionCall,
    addLimitToQuery,
    validateSecurityConstraints,
    astCache
};