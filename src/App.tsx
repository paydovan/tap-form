import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, CheckCircle2, AlertCircle, X, FileText } from "lucide-react"

// Importações dos componentes do Shadcn (ajuste os caminhos conforme seu projeto)
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import axios from "axios"

// Schema de validação (define os campos e regras)
const formSchema = z.object({
  titulo: z.string().min(2, "O título é obrigatório."),
  emailSolicitante: z.email("Insira um email válido."),
  areaSolicitante: z.string({ error: "Selecione uma área." }),
  isHomologado: z.boolean(),
  
  // Campos condicionais (validamos depois ou deixamos opcional aqui e tratamos no submit)
  nomeFornecedor: z.string().min(2, "Nome do fornecedor é obrigatório."),
  codigoInterno: z.string().optional(),
  
  contexto: z.string().min(10, "Forneça mais detalhes sobre o contexto."),
  urgencia: z.string({ error: "Selecione a urgência." }),
  impacto: z.string().min(5, "Descreva o impacto."),
})

// Tipo inferido do schema
type FormValues = z.infer<typeof formSchema>

function App() {
  // Estado local para controle visual extra se necessário, 
  // mas o hook-form gerencia o estado principal.
  const [files, setFiles] = useState<File[]>([])
  
  // Função para lidar com a seleção de arquivos
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Converte o FileList para Array e adiciona aos existentes
      const newFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...newFiles])
    }
  }

  // Função para remover um arquivo específico da lista
  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titulo: "",
      emailSolicitante: "",
      isHomologado: false,
      nomeFornecedor: "",
      codigoInterno: "",
      contexto: "",
      impacto: "",
    },
  })

  // Observa o valor do checkbox para renderização condicional
  const isHomologado = form.watch("isHomologado")

  // Função auxiliar para converter arquivo em Base64
  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // O resultado vem como "data:image/png;base64,iVBORw0KGgo..."
        // Para o Power Automate/SharePoint, geralmente precisamos apenas da parte DEPOIS da vírgula.
        const result = reader.result as string;
        // Se quiser mandar COM o prefixo (data:...), use apenas 'result'.
        // Se quiser mandar SÓ o conteúdo (raw), use o split abaixo:
        const base64Content = result.split(',')[1]; 
        resolve(base64Content);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // No submit, você acessaria o array 'files'
  async function onSubmit(data: FormValues) {
    try {
      // 1. Preparar array de anexos (se houver e não for homologado)
      let anexosBase64: { nome: string; conteudo: string; tipo: string }[] = [];

      if (!data.isHomologado && files.length > 0) {
        // Convertemos todos os arquivos em paralelo
        anexosBase64 = await Promise.all(
          files.map(async (file) => {
            const base64String = await convertToBase64(file);
            return {
              nome: file.name,     // Ex: "contrato.pdf"
              conteudo: base64String, // A string gigante em base64
              tipo: file.type      // Ex: "application/pdf"
            };
          })
        );
      }

      // 2. Montar o JSON Payload (Objeto JavaScript simples)
      const payload = {
        titulo: data.titulo,
        emailSolicitante: data.emailSolicitante,
        areaSolicitante: data.areaSolicitante,
        isHomologado: data.isHomologado,
        // Campos condicionais
        nomeFornecedor: data.nomeFornecedor || null,
        codigoInterno: data.codigoInterno || null,
        contexto: data.contexto,
        urgencia: data.urgencia,
        impacto: data.impacto,
        // Aqui vai sua lista de arquivos
        anexos: anexosBase64 
      };

      console.log("Enviando Payload:", payload); // Para você checar no console

      // 3. Enviar via Axios como JSON (padrão)
      const response = await axios.post(
        "https://defaulta0c9fd24e2324d0987a31a2adf01f4.a8.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/637a33973a18470e985ea255060b483e/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=jn4qtwr6RELpUnjHtxOZsdjwT1Lcku1XwjNh_Zz1alM", 
        payload
      );

      console.log("Sucesso:", response.data);
      alert("Solicitação enviada com sucesso!");

      // Limpar estado se quiser
      form.reset();
      setFiles([]);

    } catch (error) {
      console.error("Erro ao enviar:", error);
      alert("Erro ao enviar a solicitação.");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">TAP - Homologação de Matérias-Primas</CardTitle>
          <CardDescription>
            Abertura de processo para homologação de novas matérias-primas e produtos industriais.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Seção: Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="titulo"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-2">
                      <FormLabel>Título da Solicitação</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pó de Iogurte" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="emailSolicitante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email do Solicitante</FormLabel>
                      <FormControl>
                        <Input placeholder="seu.email@empresa.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="areaSolicitante"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Área Solicitante</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="cursor-pointer">
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Suprimentos">Suprimentos</SelectItem>
                          <SelectItem value="P&D">P&D</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-4 pb-2">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Dados do Fornecedor
                </h3>
                
                <FormField
                  control={form.control}
                  name="isHomologado"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-4 bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="cursor-pointer"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Fornecedor já é Homologado?
                        </FormLabel>
                        <FormDescription>
                          Marque se o fornecedor já possui cadastro ativo na empresa.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {/* Renderização Condicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  
                  <FormField
                    control={form.control}
                    name="nomeFornecedor"
                    render={({ field }) => (
                      <FormItem className={isHomologado ? "col-span-1" : "col-span-2"}>
                        <FormLabel>Nome do Fornecedor</FormLabel>
                        <FormControl>
                          <Input placeholder="Razão Social ou Nome Fantasia" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isHomologado ? (
                    <FormField
                      control={form.control}
                      name="codigoInterno"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código Interno (ERP)</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: FOR-9921" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="col-span-2">
                      <FormLabel>Anexar Documentos do Fornecedor</FormLabel>
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-8 bg-white hover:bg-slate-50 transition-colors">
                        <div className="text-center w-full">
                          <Upload className="mx-auto h-10 w-10 text-slate-400" aria-hidden="true" />
                          <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-transparent font-semibold text-blue-600 focus-within:outline-none hover:text-blue-500"
                            >
                              <span>Clique para selecionar</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                multiple // <--- IMPORTANTE: Permite múltiplos arquivos
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                          </div>
                          <p className="text-xs leading-5 text-slate-500 mt-1">PDF, Imagens ou ZIP até 20MB</p>
                        </div>
                      </div>

                      {/* Lista de Arquivos Selecionados */}
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-medium text-slate-700">Arquivos selecionados ({files.length}):</p>
                          <div className="grid grid-cols-1 gap-2">
                            {files.map((file, index) => (
                              <div key={`${file.name}-${index}`} className="flex items-center justify-between p-2 bg-slate-100 border border-slate-200 rounded-md text-sm">
                                <div className="flex items-center gap-2 overflow-hidden">
                                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                                  <span className="truncate text-slate-700 font-medium">{file.name}</span>
                                  <span className="text-slate-400 text-xs">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Seção: Detalhes e Justificativa */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <FormField
                    control={form.control}
                    name="urgencia"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Urgência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full cursor-pointer">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Baixa">🟢 Baixa</SelectItem>
                            <SelectItem value="Média">🟡 Média</SelectItem>
                            <SelectItem value="Alta">🔴 Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contexto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contexto da Solicitação</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Explique o motivo desta solicitação..." 
                          className="min-h-25" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="impacto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1">
                        Impacto da Não Homologação
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="O que acontece se não seguirmos com este fornecedor?" 
                          className="min-h-20" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="px-0 pt-4 flex justify-end">
                <Button type="button" variant="outline" className="mr-4 cursor-pointer">Cancelar</Button>
                <Button type="submit" className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800 cursor-pointer">
                  Enviar Solicitação
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

export default App