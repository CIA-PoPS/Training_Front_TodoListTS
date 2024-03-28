import { ReactElement } from "react";
import { getArrowLogo } from "./logos";

export namespace TodoTypes {
  export enum TodosType {
    Check,
    List,
    Completed,
  }

  export class TodoPrefix {
    private m_prefix: ReactElement;
    private m_type: TodosType;
    private m_str: string;

    private constructor(type: TodosType, prefix: ReactElement, str: string) {
      this.m_prefix = prefix;
      this.m_type = type;
      this.m_str = str;
    }

    getType = () => this.m_type;
    getPrefix = () => this.m_prefix;
    getString = () => this.m_str;

    private static getPrefix(prefix: string): [boolean, TodoPrefix | null] {
      switch (prefix) {
        case "-":
          return [true, this.List];
        default:
          return [false, null];
      }
    }

    private static hasPrefix(content: string): [boolean, TodoPrefix | null] {
      const whitespace_pos = content.indexOf(" ");
      if (whitespace_pos < 0) return [false, null];
      return this.getPrefix(content.slice(0, whitespace_pos));
    }

    static extractFrom(content: string): TodoPrefix {
      const prefix = this.hasPrefix(content);
      return prefix[0] ? prefix[1]! : this.List;
    }

    static get(prefix: string): TodoPrefix {
      const result = this.getPrefix(prefix);
      return result[0] ? result[1]! : this.List;
    }

    static removeFrom(content: string): string {
      const prefix = this.hasPrefix(content);
      if (!prefix) return content;
      const whitespace_pos = content.indexOf(" ");
      return content.slice(whitespace_pos).trimStart();
    }

    static List = new TodoPrefix(TodosType.List, getArrowLogo("h-8 w-8"), "-");
  }

  export interface ITodos {
    getType(): TodosType;
    createAt(): number;
    content(): string;
    completed(): boolean;
    getDTO(): TodoDTO;
  }

  export type TodoDTO = {
    createAt: number;
    by: string;
    content: string;
    prefix: string;
    completed: boolean;
  };
}

export class SimpleTodo implements TodoTypes.ITodos {
  private m_content: string;
  private m_createdAt: number;
  protected m_prefix: TodoTypes.TodoPrefix;
  private m_completed: boolean;

  constructor(
    content: string,
    createAt: number,
    prefix: TodoTypes.TodoPrefix,
    completed: boolean
  ) {
    this.m_content = content;
    this.m_createdAt = createAt;
    this.m_prefix = prefix;
    this.m_completed = completed;
  }

  static fromDTO(dto: TodoTypes.TodoDTO): SimpleTodo {
    return new SimpleTodo(
      dto.content,
      dto.createAt,
      TodoTypes.TodoPrefix.get(dto.prefix),
      dto.completed
    );
  }

  completed = () => this.m_completed;

  getType = () => this.m_prefix.getType();

  createAt = () => this.m_createdAt;

  content = () => `${this.m_prefix.getString()} ${this.m_content}`;

  getDTO = (): TodoTypes.TodoDTO => ({
    createAt: this.m_createdAt,
    by: "",
    content: this.m_content,
    prefix: this.m_prefix.getString(),
    completed: this.m_completed,
  });

  protected updatePrefix = (npref: string) =>
    (this.m_prefix = TodoTypes.TodoPrefix.get(npref));
}
