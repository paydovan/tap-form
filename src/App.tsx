import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"

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

// Schema de validação (define os campos e regras)
const formSchema = z.object({
  titulo: z.string().min(2, "O título é obrigatório."),
  emailSolicitante: z.string().email("Insira um email válido."),
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
  const [file, setFile] = useState<File | null>(null)

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

  function onSubmit(data: FormValues) {
    // Aqui você processaria os dados (ex: enviar para API)
    console.log("Dados do formulário:", data)
    if (!isHomologado && file) {
      console.log("Arquivo anexado:", file.name)
    }
    alert("Formulário enviado com sucesso! (Veja o console)")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-7xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-primary">TAP - Homologação de Insumos</CardTitle>
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
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a área" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ti">Tecnologia (TI)</SelectItem>
                          <SelectItem value="rh">Recursos Humanos</SelectItem>
                          <SelectItem value="financeiro">Financeiro</SelectItem>
                          <SelectItem value="operacoes">Operações</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
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
                      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-6 bg-white">
                        <div className="text-center">
                          <Upload className="mx-auto h-8 w-8 text-gray-300" aria-hidden="true" />
                          <div className="mt-2 flex text-sm leading-6 text-gray-600 justify-center">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500"
                            >
                              <span>Upload de arquivo</span>
                              <input 
                                id="file-upload" 
                                name="file-upload" 
                                type="file" 
                                className="sr-only" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                              />
                            </label>
                            <p className="pl-1">ou arraste e solte</p>
                          </div>
                          <p className="text-xs leading-5 text-gray-600">PDF, PNG, JPG até 10MB</p>
                          {file && <p className="text-sm text-green-600 mt-2 font-semibold">Arquivo: {file.name}</p>}
                        </div>
                      </div>
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
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="baixa">🟢 Baixa</SelectItem>
                            <SelectItem value="media">🟡 Média</SelectItem>
                            <SelectItem value="alta">🔴 Alta</SelectItem>
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
                <Button type="button" variant="outline" className="mr-4">Cancelar</Button>
                <Button type="submit" className="w-full md:w-auto bg-slate-900 text-white hover:bg-slate-800">
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