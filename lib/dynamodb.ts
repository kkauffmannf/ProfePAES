import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { StudyDay } from "./bedrock";

const ddbClient = new DynamoDBClient({
  region: process.env.BEDROCK_REGION || process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: (process.env.BEDROCK_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID)!,
    secretAccessKey: (process.env.BEDROCK_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY)!,
  },
});

const docClient = DynamoDBDocumentClient.from(ddbClient);
const TABLE_NAME = process.env.DYNAMODB_TABLE || "profe-paes-students";

export interface StudentProfile {
  student_id: string;
  name?: string;
  gaps: Record<string, number>;
  target_subjects: string[];
  study_path: string;
  study_plan: StudyDay[];
  current_day: number;
  streak: number;
  last_active: string;
  onboarding_complete: boolean;
  created_at: string;
}

export async function getStudent(studentId: string): Promise<StudentProfile | null> {
  try {
    const result = await docClient.send(
      new GetCommand({ TableName: TABLE_NAME, Key: { student_id: studentId } })
    );
    return (result.Item as StudentProfile) || null;
  } catch (error) {
    console.error("DynamoDB get error:", error);
    return null;
  }
}

export async function createStudent(profile: StudentProfile): Promise<void> {
  try {
    await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: profile }));
  } catch (error) {
    console.error("DynamoDB put error:", error);
    throw error;
  }
}

export async function updateStudentGaps(
  studentId: string,
  gaps: Record<string, number>
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { student_id: studentId },
        UpdateExpression: "SET gaps = :gaps, last_active = :last",
        ExpressionAttributeValues: {
          ":gaps": gaps,
          ":last": new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    console.error("DynamoDB update gaps error:", error);
    throw error;
  }
}

export async function updateStudentPlan(
  studentId: string,
  plan: StudyDay[],
  targetSubjects: string[],
  studyPath: string
): Promise<void> {
  try {
    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { student_id: studentId },
        UpdateExpression:
          "SET study_plan = :plan, target_subjects = :subjects, study_path = :path, onboarding_complete = :done, last_active = :last",
        ExpressionAttributeValues: {
          ":plan": plan,
          ":subjects": targetSubjects,
          ":path": studyPath,
          ":done": true,
          ":last": new Date().toISOString(),
        },
      })
    );
  } catch (error) {
    console.error("DynamoDB update plan error:", error);
    throw error;
  }
}

export async function updateStreak(studentId: string): Promise<number> {
  try {
    const student = await getStudent(studentId);
    if (!student) return 0;

    const lastActive = new Date(student.last_active);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let newStreak = student.streak;
    if (diffDays === 1) {
      newStreak += 1;
    } else if (diffDays > 1) {
      newStreak = 1;
    }

    await docClient.send(
      new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { student_id: studentId },
        UpdateExpression:
          "SET streak = :streak, current_day = :day, last_active = :last",
        ExpressionAttributeValues: {
          ":streak": newStreak,
          ":day": (student.current_day || 0) + 1,
          ":last": now.toISOString(),
        },
      })
    );
    return newStreak;
  } catch (error) {
    console.error("DynamoDB update streak error:", error);
    return 0;
  }
}
