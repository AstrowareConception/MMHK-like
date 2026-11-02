import {notFound} from "next/navigation";
import {DialogQaHarness} from "../../components/game-ui/dialog-qa-harness";

export const dynamic="force-dynamic";

/** Strictly local testing route. Production/preview stacks never define
 * MMHK_LOCAL_DIALOG_QA and always return 404 without rendering the harness. */
export default function DialogQaPage(){
  if(process.env.MMHK_LOCAL_DIALOG_QA!=="enabled")notFound();
  return <DialogQaHarness/>;
}
