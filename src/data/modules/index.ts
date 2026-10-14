import type { Lesson, Module, Question } from "../../types";
import { m01 } from "./m01-para";
import { m02 } from "./m02-ihtiyac";
import { m03 } from "./m03-deger";
import { m04 } from "./m04-butce";
import { m05 } from "./m05-birikim";
import { m06 } from "./m06-kazanc";
import { m07 } from "./m07-alisveris";
import { m08 } from "./m08-dijital";
import { m09 } from "./m09-paylasim";
import { m10 } from "./m10-zaman";

export const MODULES: Module[] = [m01, m02, m03, m04, m05, m06, m07, m08, m09, m10];

export const ALL_LESSONS: Lesson[] = MODULES.flatMap((m) => m.lessons);

export const ALL_QUESTIONS: Question[] = ALL_LESSONS.flatMap((l) => l.activities);

const lessonIndex = new Map(ALL_LESSONS.map((l) => [l.id, l]));
const moduleIndex = new Map(MODULES.map((m) => [m.id, m]));
const questionIndex = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));

export const getLesson = (id: string) => lessonIndex.get(id);
export const getModule = (id: string) => moduleIndex.get(id);
export const getQuestion = (id: string) => questionIndex.get(id);
