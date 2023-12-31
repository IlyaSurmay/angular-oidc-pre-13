import { Tree } from '@angular-devkit/schematics';
import { WorkspaceProject, WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import ts = require('@schematics/angular/third_party/github.com/Microsoft/TypeScript/lib/typescript');
export declare const ANGULAR_JSON_FILENAME = "angular.json";
export declare function getAngularWorkspace(tree: Tree): WorkspaceSchema;
export declare function updateProjectInAngularJson(tree: Tree, content: WorkspaceProject, projectName?: string): void;
export declare function getProject(tree: Tree, projectName?: string): WorkspaceProject;
export declare function readIntoSourceFile(host: Tree, fileName: string): ts.SourceFile;
