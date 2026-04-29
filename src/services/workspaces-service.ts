import db from "@models/index";

export async function teste() {
  try {

    const createdWorkspace = await db.workspaces.create({
      id: "01KPR8D7QQCDCATHD10E449RX1",
      name: "blumenau",
      data: JSON.stringify({"location":{"cep":"89070-270","rua":"R. Bernardino José de Oliveira","numero":81,"bairro":"Badenfurt"}}) as unknown as object
    });

    console.log("Created: ", createdWorkspace);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`[${error.cause}] ${error.message}`);
    }
  }
}
